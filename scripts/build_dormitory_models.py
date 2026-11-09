"""Build the 14 student residence archives in Blender 5.2.

blender -b -t 6 --python-exit-code 1 --python scripts/build_dormitory_models.py -- --output-dir DIR
"""

import argparse
from pathlib import Path
import sys

import bpy
from mathutils import Vector

# Estimated massing for each atlas hotspot. Values are design parameters.
# ID, length, depth, modeled levels, facade bays, stair position, canopy bay, roof heads.
BLOCKS = [
    ("NE-01", 40, 12.0, 5, 8, -1, 1, 1),
    ("NE-02", 39, 12.6, 5, 8, 1, 6, 1),
    ("NE-03", 38, 12.1, 5, 8, -1, 3, 2),
    ("NE-04", 34, 11.8, 5, 7, 1, 5, 1),
    ("NE-05", 31, 17.2, 7, 6, -1, 2, 2),
    ("NE-06", 36, 11.6, 5, 8, 1, 2, 1),
    ("NE-07", 38, 12.0, 5, 8, -1, 5, 1),
    ("NE-08", 39, 12.8, 5, 8, 1, 4, 2),
    ("NE-09", 36, 12.0, 5, 7, -1, 4, 1),
    ("NE-10", 37, 12.2, 5, 8, 1, 3, 2),
    ("NE-11", 35, 12.4, 5, 7, -1, 2, 1),
    ("NE-16", 32, 11.0, 5, 6, 1, 1, 1),
    ("NE-17", 33, 11.5, 5, 7, -1, 3, 1),
    ("NE-18", 35, 11.8, 5, 8, 1, 5, 1),
]

COLORS = {
    "Wall": "c9c9c4", "Light concrete": "e4e2d9", "Parapet": "b6bbbd",
    "Roof membrane": "909ca2", "Balcony recess": "646b6d", "Glazing": "3c5867",
    "Rail": "aebfc2", "Site": "c6c8be", "Planting": "809984", "Grille": "586970",
}
FACES = ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7))


def make_materials():
    def linear(channel):
        channel /= 255
        return channel / 12.92 if channel <= 0.04045 else ((channel + .055) / 1.055) ** 2.4

    materials = {}
    for name, color in COLORS.items():
        material = bpy.data.materials.new(name)
        material.diffuse_color = (*map(linear, bytes.fromhex(color)), 1)
        material.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = material.diffuse_color
        material.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = .4 if name == "Glazing" else .82
        materials[name] = material
    return materials


def build_residence(spec, materials):
    code, width, depth, levels, bays, stair, canopy, roof_heads = spec
    storey = 3.05
    height = levels * storey
    front = -depth / 2
    rear = depth / 2
    edge = .48
    offset = 1.5
    pitch = (width - 2 * edge - 2 * offset) / bays
    collection = bpy.data.collections.new(code)
    bpy.context.scene.collection.children.link(collection)
    pieces = {}

    def box(part, finish, center, size):
        vertices, faces = pieces.setdefault((part, finish), ([], []))
        first = len(vertices)
        x, y, z = center
        a, b, c = (dimension / 2 for dimension in size)
        vertices.extend((x+i*a, y+j*b, z+k*c) for i,j,k in (
            (-1,-1,-1), (1,-1,-1), (1,1,-1), (-1,1,-1),
            (-1,-1,1), (1,-1,1), (1,1,1), (-1,1,1)
        ))
        faces.extend(tuple(first + index for index in face) for face in FACES)

    box("Site", "Site", (0, -.32, -.24), (width + 2.4, depth + 3.4, .48))
    box("Site", "Planting", (0, rear + .95, .055), (width - 2, .58, .11))
    box("Envelope", "Wall", (0, .1, height / 2), (width - 2*edge, depth - 2*offset, height))
    for sign in (-1, 1):
        box("End walls", "Light concrete", (sign*(width/2-edge/2), 0, height/2), (edge, depth, height))

    for y, direction in ((front, -1), (rear, 1)):
        for row in range(levels + 1):
            box("Floor bands", "Light concrete", (0, y-direction*.65, row*storey),
                (width - 2*edge, 1.53, .36))
        for bay in range(bays + 1):
            x = (bay - bays/2) * pitch
            box("Facade piers", "Light concrete", (x, y-direction*.36, height/2),
                (.36, .87, height))
        for row in range(levels):
            z = row * storey
            for bay in range(bays):
                x = (bay + .5 - bays/2) * pitch
                box("Recesses", "Balcony recess", (x, y-direction*(offset-.19), z+1.44), (pitch-.42, .1, 2.36))
                for pane in (-.21, .21):
                    box("Windows", "Glazing", (x+pane*pitch, y-direction*(offset-.26), z+1.52),
                        (pitch*.32, .08, 1.55))
                if row:
                    box("Balconies", "Light concrete", (x, y-direction*.16, z+.40), (pitch-.39, .16, .57))
                    for rail in (.72, .95):
                        box("Balcony rails", "Rail", (x, y-direction*.16, z+rail), (pitch-.39, .065, .055))
                    for post in (-.40, 0, .40):
                        box("Balcony rails", "Rail", (x+post*pitch, y-direction*.16, z+.78), (.055, .055, .4))

    core_x = stair*(width/2-1.38)
    box("Stair tower", "Wall", (core_x, front+.48, height/2+.22), (2.5, 2.22, height+.44))
    for row in range(levels):
        z = row*storey+1.58
        for shift in (-.42, .42):
            box("Stair windows", "Grille", (core_x+shift, front-.64, z), (.26, .06, 1.22))
        for sign in (-1, 1):
            box("End windows", "Glazing", (sign*(width/2+.022), .55, z), (.064, .88, 1.35))

    entry_x = (canopy+.5-bays/2)*pitch
    box("Entry", "Light concrete", (entry_x, front-1.0, storey-.52), (pitch+1.0, 2.2, .32))
    box("Entry", "Site", (entry_x, front-1.1, .10), (pitch+1.1, 2.3, .20))
    box("Roof", "Roof membrane", (0, 0, height+.14), (width-.11, depth-.15, .28))
    for sign in (-1, 1):
        box("Roof edge", "Parapet", (0, sign*(depth/2-.14), height+.49), (width, .22, .58))
        box("Roof edge", "Parapet", (sign*(width/2-.14), 0, height+.49), (.22, depth, .58))
    for head in range(roof_heads):
        x = core_x*.79 if head == 0 else -core_x*.5
        box("Roof services", "Wall", (x, depth*.13, height+.65), (3.45-head*.9, 2.3, 1.25-head*.35))
        box("Roof services", "Parapet", (x, depth*.13, height+1.29-head*.175), (3.7-head*.9, 2.55, .16))
    if code == "NE-05":
        box("Apartment wing", "Light concrete", (width/2-3.4, rear+1.6, height/2), (6.8, 3.9, height))
        box("Apartment wing", "Parapet", (width/2-3.4, rear+1.6, height+.15), (7.0, 4.1, .30))
        for row in range(levels):
            for bay in (-1, 0, 1):
                box("Wing windows", "Glazing", (width/2-3.4+bay*1.72, rear+3.57, row*storey+1.52), (1.13, .09, 1.31))

    for (part, finish), (vertices, faces) in pieces.items():
        mesh = bpy.data.meshes.new(f"{code} {part} {finish}")
        mesh.from_pydata(vertices, [], faces)
        mesh.materials.append(materials[finish])
        mesh.update()
        collection.objects.link(bpy.data.objects.new(mesh.name, mesh))
    collection["basis"] = "Campus atlas hotspot, aerial panoramas and official dorm exterior; approximated massing."
    return collection


def aim(obj, target):
    obj.rotation_euler = (target-obj.location).to_track_quat("-Z", "Y").to_euler()


def configure_studio(scene):
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 720
    scene.render.resolution_y = 460
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.world = bpy.data.worlds.new("Overcast daylight")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.72, .79, .91, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = .5
    studio = bpy.data.collections.new("Preview studio")
    scene.collection.children.link(studio)
    camera = bpy.data.objects.new("Archive camera", bpy.data.cameras.new("Archive camera"))
    studio.objects.link(camera)
    camera.data.type = "ORTHO"
    scene.camera = camera
    for name, location, energy, size in (
        ("Daylight", (-30,-40,58), 53000, 48),
        ("Fill", (20,29,35), 18000, 38),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy, data.size = energy, size
        light = bpy.data.objects.new(name, data)
        studio.objects.link(light)
        light.location = location
        aim(light, Vector((0,0,6)))
    return camera, studio


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--only", choices=[spec[0] for spec in BLOCKS])
    args = parser.parse_args(sys.argv[sys.argv.index("--")+1:])
    output = args.output_dir.resolve()
    output.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0
    materials = make_materials()
    scene = bpy.context.scene
    scene["reference"] = "DGPT student residences / approximate exteriors; building IDs follow the project atlas."
    camera, studio = configure_studio(scene)
    collections = []
    for spec in BLOCKS:
        code, width, depth, levels, *_ = spec
        if args.only and args.only != code:
            continue
        group = build_residence(spec, materials)
        collections.append((group, spec))
        bpy.ops.object.select_all(action="DESELECT")
        for obj in group.objects:
            obj.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(output/f"{code}.glb"), export_format="GLB",
                                  use_selection=True, export_texcoords=False, export_normals=True,
                                  export_animations=False)
        for item in scene.collection.children:
            if item != studio:
                item.hide_render = item != group
        target = Vector((0, .3, levels*3.05*.44))
        camera.location = target + Vector((27,-59,35))
        aim(camera, target)
        camera.data.ortho_scale = max(width*1.23, (levels*3.05+depth*.46)*1.76)
        scene.render.filepath = str(output/f"{code}.png")
        bpy.ops.render.render(write_still=True)
    # Spread out the editable building collections so none overlap in the source file.
    for index, (group, spec) in enumerate(collections):
        x = (index%4-1.5)*53
        y = (1.5-index//4)*28
        for obj in group.objects:
            obj.location += Vector((x,y,0))
        group.hide_render = False
    camera.location = (109,-225,171)
    aim(camera, Vector((0,0,5)))
    camera.data.ortho_scale = 260
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == "VIEW_3D":
                region = area.spaces.active.region_3d
                region.view_location = (0, 0, 4)
                region.view_distance = 240
                region.view_rotation = camera.rotation_euler.to_quaternion()
                region.view_perspective = "ORTHO"
                area.spaces.active.shading.color_type = "MATERIAL"
    bpy.ops.wm.save_as_mainfile(filepath=str(output/"DGPT-residences.blend"))


if __name__ == "__main__":
    main()
