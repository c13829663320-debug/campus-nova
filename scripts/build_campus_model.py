"""Build the DGPT reference model with Blender 5.2 and export its web assets.

From the repository root:
blender -b -t 4 --factory-startup --python-exit-code 1 --python scripts/build_campus_model.py -- --blend ../DGPT-campus.blend --glb ../campus-raw.glb
"""
import argparse

import math
from pathlib import Path
import random
import sys

import bpy
from mathutils import Vector

PALETTE = {
    "base": "526D70", "trim": "CDDAD4", "turf": "B6C89D", "garden": "98B685",
    "water": "4D959E", "ripple": "80B6B4", "shore": "78976E",
    "pavement": "DFDCCB", "road": "A6ADAA", "tile": "C9C5B2",
    "stone": "D6CCC0", "concrete": "ECE3D1",
    "roof": "697E83", "glass": "4B6875", "metal": "B7C6C7", "wood": "BA9A70",
    "solar": "425C75", "track": "B66759", "line": "F5EDE0", "pitch": "759B64",
    "stripe": "85A972", "court": "67969B", "pool": "61B3CB",
    "bark": "6D6352", "leaf": "658D65", "leaf-light": "85A96D", "leaf-dark": "527861",
}
MATERIALS = {}
RNG = random.Random(42)


def linear(channel):
    channel /= 255
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def setup_materials():
    for name, value in PALETTE.items():
        color = tuple(linear(c) for c in bytes.fromhex(value)) + (1,)
        mat = bpy.data.materials.new(name)
        mat.diffuse_color = color
        mat.use_nodes = True
        shader = mat.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = color
        shader.inputs["Roughness"].default_value = 0.44 if name in {"glass", "water", "solar"} else 0.86
        MATERIALS[name] = mat


def collection(name):
    group = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(group)
    return group


def rect(x, z, width, depth):
    return [(x-width/2, z-depth/2), (x+width/2, z-depth/2),
            (x+width/2, z+depth/2), (x-width/2, z+depth/2)]


def oval(x, z, rx, rz, steps=48):
    return [(x + rx*math.cos(a*math.tau/steps), z + rz*math.sin(a*math.tau/steps)) for a in range(steps)]


class Mesh:
    """Accumulate faces into a named Blender object without per-face objects."""

    def __init__(self):
        self.vertices = []
        self.faces = []
        self.colors = []

    def add(self, vertices, faces, colors):
        start = len(self.vertices)
        self.vertices.extend((x, -z, h) for x, z, h in vertices)
        self.faces.extend(tuple(start + i for i in face) for face in faces)
        self.colors.extend(colors)

    def flat(self, polygon, height, material):
        self.add([(x, z, height) for x, z in polygon], [tuple(reversed(range(len(polygon))))], [material])

    def prism(self, polygon, bottom, top, wall, cap=None):
        n = len(polygon)
        vertices = [(x, z, h) for h in (bottom, top) for x, z in polygon]
        faces = [tuple(range(n)), tuple(reversed(range(n, n*2)))]
        faces += [(i, i+n, (i+1)%n+n, (i+1)%n) for i in range(n)]
        self.add(vertices, faces, [wall, cap or wall] + [wall]*n)

    def box(self, x, z, width, depth, bottom, top, wall, cap=None):
        self.prism(rect(x, z, width, depth), bottom, top, wall, cap)

    def ring(self, outer, inner, height, material):
        for i in range(len(outer)):
            j = (i+1) % len(outer)
            self.flat([outer[i], outer[j], inner[j], inner[i]], height, material)

    def path(self, points, width, height, material):
        # Miter the corners to form one continuous strip.
        normals = []
        for (x, z), (nx, nz) in zip(points, points[1:]):
            length = math.hypot(nx-x, nz-z)
            normals.append((-(nz-z)/length, (nx-x)/length))
        edges = []
        for i, (x, z) in enumerate(points):
            a = normals[max(i-1, 0)]
            b = normals[min(i, len(normals)-1)]
            factor = width / (2 * max(0.55, 1 + a[0]*b[0] + a[1]*b[1]))
            dx, dz = (a[0]+b[0])*factor, (a[1]+b[1])*factor
            edges.append(((x+dx, z+dz), (x-dx, z-dz)))
        for (a, b), (c, d) in zip(edges, edges[1:]):
            self.flat([a, b, d, c], height, material)

    def beam(self, a, b, width, material):
        start, end = Vector(a), Vector(b)
        axis = (end-start).normalized()
        right = axis.cross(Vector((0, 1, 0)))
        if right.length < 0.001:
            right = axis.cross(Vector((1, 0, 0)))
        right.normalize()
        up = right.cross(axis)
        corners = [point + (right*u+up*v)*width/2 for point in (start, end)
                   for u,v in ((-1,-1),(1,-1),(1,1),(-1,1))]
        faces = [(3,2,1,0), (4,5,6,7), (0,1,5,4), (1,2,6,5), (2,3,7,6), (3,0,4,7)]
        self.add(corners, faces, [material]*6)

    def finish(self, name, group):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(self.vertices, [], self.faces)
        keys = list(dict.fromkeys(self.colors))
        slots = {key: i for i, key in enumerate(keys)}
        for key in keys:
            mesh.materials.append(MATERIALS[key])
        for face, color in zip(mesh.polygons, self.colors):
            face.material_index = slots[color]
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        group.objects.link(obj)
        return obj


def smooth_outline(points, steps=4):
    outline = []
    for index, b in enumerate(points):
        a, c, d = points[index-1], points[(index+1)%len(points)], points[(index+2)%len(points)]
        for step in range(steps):
            t = step/steps
            outline.append(tuple(0.5*(2*b[j]+(-a[j]+c[j])*t+
                (2*a[j]-5*b[j]+4*c[j]-d[j])*t*t+(-a[j]+3*b[j]-3*c[j]+d[j])*t*t*t) for j in (0,1)))
    return outline


SITE = [(-51,-18),(-45,-26),(-13,-29),(22,-28),(43,-23),(52,-14),(53,9),
        (46,22),(25,26),(-5,27),(-36,24),(-50,16),(-54,2)]
LAKE = smooth_outline([(-31,-1),(-28,-7),(-19,-9),(-10,-7),(0,-6),(13,-7),(23,-4),
                      (27,1),(23,5),(15,7),(1,6),(-10,5),(-24,8),(-30,4)])
ROADS = [
    [(-47,9),(-39,13),(-23,15),(1,15),(18,14),(29,9),(44,8),(48,12)],
    [(-46,10),(-48,-4),(-43,-14),(-33,-17),(-15,-17),(0,-18),(20,-16),(36,-12),(44,-5),(44,8)],
    [(-34,-16),(-35,-5),(-36,5),(-33,14)],
    [(-22,15),(-22,21),(2,23),(24,21),(29,14)],
    [(27,9),(30,1),(27,-8),(20,-16)],
]
WALKS = [
    [(-32,1),(-30,-5),(-22,-10),(-14,-10),(-4,-8),(10,-9),(21,-8),(28,-5),(30,1),
     (26,7),(18,9),(8,8),(-7,7),(-17,8),(-25,9),(-31,6),(-32,1)],
    [(-9,7),(-9,13)], [(10,8),(10,14)], [(3,-9),(3,-17)], [(21,-8),(20,-15)],
]


def site(group):
    mesh = Mesh()
    mesh.prism([(x*1.018,z*1.018) for x,z in SITE], -2.4, -0.25, "base", "trim")
    mesh.prism(SITE, -0.32, 0, "shore", "turf")
    shore = [(x*1.032,z*1.13) for x,z in LAKE]
    mesh.flat(shore, 0.017, "shore")
    mesh.flat(LAKE, 0.03, "water")
    for x,z,length in [(-25,3,4.4),(-19,-5,3),(-12,1,3.3),(-3,3,4),(1,-3,3),(17,3,4),(22,0,2.8)]:
        mesh.path([(x-length/2,z),(x,z-0.11),(x+length/2,z)], 0.045, 0.037, "ripple")
    for route in ROADS:
        mesh.path(route, 2.4, 0.039, "pavement")
        mesh.path(route, 1.85, 0.048, "road")
    for route in WALKS:
        mesh.path(route, 0.65, 0.055, "pavement")
    for x,z,w,d in [(-9,-8,5,3),(-9,8,6,3),(11,-8,4,3),(11,8,5,3),(41,8,8,5),(-43,10,5,4)]:
        mesh.box(x,z,w,d,0.05,0.11,"tile","pavement")
    mesh.finish("Terrain • Yueying Lake and paths", group)

    mesh = Mesh()
    for x,z,depth in [(-9,-0.1,15.5),(11,0,15.8)]:
        mesh.box(x,z,1.65,depth,0.17,0.40,"stone","pavement")
        for along in (-0.28,0.28):
            mesh.box(x,z+depth*along,1.4,0.38,0.02,0.18,"stone")
        for side in (-0.78,0.78):
            mesh.box(x+side,z,0.055,depth,0.64,0.70,"metal")
            for i in range(12):
                nz = z+depth*(i/11-0.5)
                mesh.box(x+side,nz,0.07,0.07,0.4,0.65,"metal")
    mesh.finish("Lake crossings • straight decks and rails", group)


BUILDINGS = []


def building(group, name, x, z, w, d, h, floors, style="teaching"):
    mesh = Mesh()
    wall = "concrete"
    mesh.box(x,z,w+0.36,d+0.42,0.08,0.20,"tile","pavement")
    mesh.box(x,z,w,d,0.20,h,wall)
    mesh.box(x,z,w+0.19,d+0.19,h,h+0.19,"stone","roof")
    for floor in range(floors):
        y = 0.48 + (h-0.55)*floor/floors
        gap = (h-0.55)/floors
        for side in (-1,1):
            mesh.box(x,z+side*d/2,w-0.36,0.032,y+gap*0.19,y+gap*0.77,"glass")
            for bay in range(1, max(3, round(w/0.72))):
                bays = max(3, round(w/0.72))
                px = x + w*(bay/bays-0.5)
                mesh.box(px,z+side*(d/2+0.035),0.080,0.12,y+gap*0.17,y+gap*0.78,wall)
            if style == "dorm":
                mesh.box(x,z+side*d/2,w+0.03,0.27,y+gap*0.14,y+gap*0.29,"stone")
            mesh.box(x+side*w/2,z,0.037,d*0.52,y+gap*0.24,y+gap*0.72,"glass")
    for side in (-1,1):
        mesh.box(x+side*(w/2-0.11),z,0.15,d,h+0.19,h+0.40,"stone")
        mesh.box(x,z+side*(d/2-0.10),w-0.22,0.14,h+0.19,h+0.40,"stone")
    if style == "teaching":
        mesh.box(x,z+d/2+0.52,w*0.40,1.1,0.99,1.18,"metal")
        mesh.box(x,z+d/2+0.20,w*0.39,0.39,0.18,0.31,"pavement")
        for p in (-0.18,0.18):
            mesh.box(x+w*p,z+d/2+0.88,0.13,0.13,0.18,1.0,"stone")
    if style == "dorm":
        mesh.box(x+w*0.24,z,w*0.20,d*0.33,h+0.19,h+0.57,"concrete","roof")
    elif style == "canteen":
        # The campus album shows a continuous canopy and tall façade piers.
        mesh.box(x,z+d/2+0.31,w+0.20,0.98,h-0.16,h+0.14,"concrete","roof")
        for i in range(10):
            px = x + w*(i/9-0.5)
            mesh.box(px,z+d/2+0.64,0.15,0.23,0.20,h-0.15,"concrete")
        for i in range(3):
            mesh.box(x-w/2+0.4+i*0.48,z-d*0.25,0.15,0.19,h+0.19,h+0.75,"stone")
    else:
        for row in (-0.21, 0.21):
            mesh.box(x,z+d*row,w*0.72,d*0.23,h+0.20,h+0.27,"solar")
    BUILDINGS.append((x,z,w+1.2,d+1.2))
    mesh.finish(name, group)


def library(group):
    mesh = Mesh()
    x,z = -17,-5.8
    mesh.box(x,z,12.4,7.4,0.06,0.36,"tile","pavement")
    mesh.prism(oval(x-1.7,z-0.45,4.1,3.0,36),0.36,4.42,"glass")
    for level in (0.42,1.22,2.03,2.83,3.62,4.38):
        mesh.prism(oval(x-1.7,z-0.45,4.20,3.10,36),level,level+0.14,"concrete")
    for px,pz in oval(x-1.7,z-0.45,4.19,3.10,44):
        mesh.box(px,pz,0.083,0.083,0.42,4.52,"concrete")
    mesh.box(x+3.35,z+1.25,7.1,3.3,1.45,3.35,"glass")
    for px in (x+1.1,x+4.3):
        mesh.box(px,z+1.25,0.50,1.85,0.10,1.51,"stone")
    mesh.box(x+3.50,z+1.25,7.40,3.72,3.42,3.64,"wood","roof")
    mesh.box(x+3.50,z+1.25,7.40,3.65,1.42,1.59,"concrete")
    for side in (-1,1):
        for i in range(5):
            px = x+0.05+i*1.36
            a,b = (1.58,3.47) if i%2 == 0 else (3.47,1.58)
            mesh.beam((px,z+1.25+side*1.69,a),(px+1.36,z+1.25+side*1.69,b),0.14,"wood")
    BUILDINGS.append((x,z,13,8))
    mesh.finish("Library • curved reading hall and cantilevered truss", group)


def teaching_hall(group):
    building(group,"Duxing Hall • teaching",0.5,10.8,9.0,3.4,3.7,4)
    mesh = Mesh()
    # The lakeside academic façades step down toward the shoreline.
    for level in range(3):
        x,z,w,d = -0.65, 8.18+level*0.44, 6.3-level*0.76, 2.10-level*0.45
        floor = 0.20+level*0.76
        mesh.box(x,z,w-0.10,d-0.08,floor,floor+0.63,"glass")
        mesh.box(x,z,w,d,floor+0.63,floor+0.77,"concrete","tile")
        for bay in range(7):
            mesh.box(x+w*(bay/6-0.5),z-d*0.45,0.12,0.19,floor,floor+0.67,"concrete")
    BUILDINGS.append((-0.65,8.2,7,2.9))
    mesh.finish("Duxing Hall • stepped lakeside annex",group)


def track(group):
    mesh = Mesh()
    x,z = 37.0, 16.2

    def loop(radius):
        return [(x+radius*math.cos(a)+4.2*(1 if i<24 else -1),z+radius*math.sin(a))
                for i,a in enumerate([-math.pi/2 + math.pi*j/23 for j in range(24)] +
                                     [math.pi/2 + math.pi*j/23 for j in range(24)])]

    mesh.prism(loop(5.45),0.02,0.14,"tile","track")
    mesh.flat(loop(3.55),0.16,"pitch")
    for lane in range(7):
        radius = 3.61+0.28*lane
        mesh.ring(loop(radius+0.024),loop(radius),0.174,"line")
    for i in range(6):
        mesh.flat(rect(x-5+i*2,z,0.98,6.26),0.17,"stripe")
    pitch = rect(x,z,11.9,6.22)
    mesh.path(pitch+[pitch[0]],0.055,0.182,"line")
    mesh.path([(x,z-3.11),(x,z+3.11)],0.055,0.182,"line")
    mesh.ring(oval(x,z,0.92,0.92,24),oval(x,z,0.86,0.86,24),0.183,"line")
    for side in (-1,1):
        a = x+side*5.94
        mesh.path([(a,z-1.6),(a-side*1.65,z-1.6),(a-side*1.65,z+1.6),(a,z+1.6)],0.06,0.184,"line")
        mesh.box(a+side*0.28,z,0.50,0.82,0.17,0.38,"metal")
    for i in range(4):
        mesh.box(x-0.8,z-6.1-i*0.25,9.4,0.27,0.13,0.33+i*0.19,"concrete","stone")
    BUILDINGS.append((x,z-0.6,20.2,13))
    mesh.finish("Athletics • lane markings, pitch and terraces", group)


def sports_hall(group):
    mesh = Mesh()
    x,z = 25.2, 14.2
    mesh.box(x,z,6.1,6.7,0.12,2.4,"concrete","roof")
    for side in (-1,1):
        mesh.box(x+side*3.05,z,0.05,5.9,0.72,1.98,"glass")
    for z0 in (z-2.2,z,z+2.2):
        for i in range(10):
            def roof_point(n):
                a = math.pi*n/10
                return z0+1.1*math.cos(a), 2.43+0.88*math.sin(a)
            a,h = roof_point(i)
            b,k = roof_point(i+1)
            mesh.add([(x-3.13,a,h),(x-3.13,b,k),(x+3.13,b,k),(x+3.13,a,h)],
                     [(3,2,1,0)], ["metal"])
    mesh.finish("Covered courts • three barrel vaults",group)
    BUILDINGS.append((x,z,7,7.5))


def courts(group):
    mesh = Mesh()
    for x,z,w,d,material in [(40,1.8,7.8,4,"pool"),(30,-15,7.4,4.5,"court"),(-33,-12,7,3.8,"court")]:
        mesh.box(x,z,w+0.46,d+0.46,0.03,0.14,"tile","pavement")
        mesh.flat(rect(x,z,w,d),0.16,material)
        for i in (-1,0,1):
            mesh.path([(x-w/2,z+i*d/4),(x+w/2,z+i*d/4)],0.04,0.17,"line")
        BUILDINGS.append((x,z,w+0.8,d+0.8))
    mesh.finish("Courts • outdoor sport surfaces",group)


def gate(group):
    mesh = Mesh()
    for z in (7.45,9.05):
        mesh.box(46.3,z,0.7,0.40,0.09,1.38,"stone")
    mesh.box(46.3,8.25,1.12,2.40,1.38,1.59,"concrete","roof")
    mesh.box(47.0,9.75,1.2,0.95,0.10,0.85,"concrete","roof")
    mesh.finish("East entrance • gate canopy",group)
    BUILDINGS.append((46.4,8.5,2.2,3.9))


def in_polygon(x,z,polygon):
    inside = False
    for (a,b),(c,d) in zip(polygon,polygon[1:]+polygon[:1]):
        if (b>z) != (d>z) and x < (c-a)*(z-b)/(d-b)+a:
            inside = not inside
    return inside


def near_path(x,z,routes,buffer):
    for route in routes:
        for (a,b),(c,d) in zip(route,route[1:]):
            dx,dz = c-a,d-b
            t = max(0,min(1,((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz)))
            if math.hypot(x-a-t*dx,z-b-t*dz)<buffer:
                return True
    return False


def trees(group):
    mesh = Mesh()
    planted = []
    for _ in range(2600):
        x,z = RNG.uniform(-52,52), RNG.uniform(-27,26)
        if not in_polygon(x,z,SITE) or in_polygon(x,z,LAKE):
            continue
        if near_path(x,z,ROADS,1.62) or near_path(x,z,WALKS,0.58):
            continue
        if any(abs(x-a)<w/2+0.35 and abs(z-b)<d/2+0.35 for a,b,w,d in BUILDINGS):
            continue
        if any(math.hypot(x-a,z-b)<1.25 for a,b in planted):
            continue
        planted.append((x,z))
        h = RNG.uniform(0.85,1.95)
        r = RNG.uniform(0.32,0.60)*h
        mesh.prism(oval(x,z,0.07,0.07,5),0.02,h*0.69,"bark")
        color = RNG.choice(("leaf","leaf","leaf-light","leaf-dark"))
        ring = oval(x,z,r,r,7)
        # Angular crowns read clearly at campus scale.
        vertices = [(px,pz,h*0.78) for px,pz in ring]+[(x,z,h*0.40),(x+r*0.14,z,h*1.30)]
        faces = [(i,(i+1)%7,7) for i in range(7)] + [((i+1)%7,i,8) for i in range(7)]
        mesh.add(vertices,faces,[color]*len(faces))
        if len(planted) == 380:
            break
    mesh.finish("Tree canopy • campus landscape",group)


def configure_preview(scene, group):
    scene.world = bpy.data.worlds.new('Campus sky')
    scene.world.color = (0.16,0.16,0.16)
    bpy.ops.object.camera_add(location=(40,-88,82))
    camera = bpy.context.object
    camera.name = "Campus overview"
    camera.rotation_euler = (Vector((0,0,1.5))-camera.location).to_track_quat("-Z","Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 114
    scene.camera = camera
    bpy.ops.object.light_add(type="SUN", location=(-45,-38,64))
    sun = bpy.context.object
    sun.rotation_euler = (-sun.location).to_track_quat("-Z","Y").to_euler()
    sun.data.energy = 2.25
    sun.data.angle = math.radians(15)
    for obj in (camera,sun):
        for prior in list(obj.users_collection):
            prior.objects.unlink(obj)
        group.objects.link(obj)
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 780
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX"
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == "VIEW_3D":
                area.spaces.active.region_3d.view_perspective = "CAMERA"
                area.spaces.active.shading.color_type = "MATERIAL"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--blend", required=True, type=Path)
    parser.add_argument("--glb", required=True, type=Path)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args(sys.argv[sys.argv.index("--")+1:])
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_materials()
    terrain = collection("01 • Land and water")
    academics = collection("02 • Academic and campus life")
    dorms = collection("03 • Residences")
    landmarks = collection("04 • Signature landmarks")
    sport = collection("05 • Sports")
    landscaping = collection("06 • Landscaping")
    scene = bpy.context.scene
    scene["reference"] = "DGPT Songshan Lake campus. Photo-based interpretation; coordinates and heights are illustrative."
    site(terrain)
    library(landmarks)
    gate(landmarks)
    track(sport)
    sports_hall(sport)
    courts(sport)
    teaching_hall(landmarks)
    building(landmarks,"Zhilian canteen",6.2,-11.7,8.5,3.8,3.2,3,"canteen")
    building(landmarks,"Xiuyuan Hall • student hub",20.3,-11.8,6.9,4.1,3.1,3)
    for i,(x,z,w,d,h) in enumerate([
        (-40,-8,6.5,3.4,3.4),(-41,-2.8,5.7,3.5,3.8),(-40,3.2,6.5,3.4,3.7),
        (-39,17.5,8.1,3.8,4.0),(-28,11.4,7.4,3.2,3.5),(-29,19.1,7.7,3.7,3.9),
        (-17,11.5,7.2,3.1,3.4),(-16,19.1,9.1,3.7,4.1),(-4,19.7,9.3,3.7,4.2),
        (9,19.5,9.6,4.1,4.4),(14,11.0,7.9,3.7,3.8),(20,19.3,5.1,3.3,3.8),
        (-22,-13.5,5.6,2.5,3.3),(-5,-12.8,6.1,3.2,3.4),
        (29,6,6.2,3.0,2.8),(37,-4,6.1,3.3,3.2),
    ],1):
        building(academics,f"Campus block {i:02}",x,z,w,d,h,4)
    for row,(start,z,count) in enumerate([(-27,-22,5),(-24,-18.8,4),(13,-22,4),(15,-18.8,3),(34,-12,2)]):
        for col in range(count):
            x = start+col*7.15
            building(dorms,f"Residence {row+1}.{col+1}",x,z,5.6,2.22,3.65+0.32*((row+col)%3),5,"dorm")
    trees(landscaping)
    configure_preview(scene,collection("07 • Preview camera and sun"))
    args.blend.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(args.blend.resolve()))
    bpy.ops.object.select_all(action="DESELECT")
    for obj in scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)
    args.glb.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(args.glb.resolve()), export_format="GLB",
                              use_selection=True, export_texcoords=False, export_normals=True,
                              export_animations=False, export_yup=True)
    if args.preview:
        scene.render.filepath = str(args.preview.resolve())
        bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
