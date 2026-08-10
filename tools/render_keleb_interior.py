#!/usr/bin/env python3
import bpy, os, math
from mathutils import Vector
IN=os.environ.get('KELEB_INTERIOR_IN','assets/mjx7303/keleb-interior.glb')
OUT=os.environ.get('KELEB_RENDER_DIR','/tmp/keleb-render')
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=IN)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.world.color=(.018,.020,.024)
# floor-light setup
bpy.ops.object.light_add(type='AREA',location=(0,-1.6,3.0));key=bpy.context.object;key.data.energy=900;key.data.shape='RECTANGLE';key.data.size=4
bpy.ops.object.light_add(type='AREA',location=(2.3,.2,2.0));bpy.context.object.data.energy=500;bpy.context.object.data.size=2.5
bpy.ops.object.light_add(type='AREA',location=(-2.3,.4,1.8));bpy.context.object.data.energy=350;bpy.context.object.data.size=2.0
bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.lens=48
def aim(pt):cam.rotation_euler=(Vector(pt)-cam.location).to_track_quat('-Z','Y').to_euler()
views={
'front':((0,-4.0,1.50),(0,.0,1.2)),
'driver':((-2.25,-2.5,1.55),(-.35,.0,1.2)),
'codriver':((2.25,-2.5,1.55),(.35,.0,1.2)),
'rear':((0,3.6,1.55),(0,.0,1.2)),
'top':((0,-.2,4.5),(0,.0,1.0))}
for name,(loc,target) in views.items():
    cam.location=loc;aim(target);scene.render.filepath=os.path.join(OUT,name+'.png');bpy.ops.render.render(write_still=True)
print('rendered',len(views),'Keleb interior views to',OUT)
