import os
import xml.etree.ElementTree as ET
import mujoco
import numpy as np
from PIL import Image, ImageDraw, ImageFont

XML = os.path.join(os.path.dirname(__file__), "RP1_description", "mjcf", "robot.xml")
OUT = os.path.join(os.path.dirname(__file__), "rp1_views")
os.makedirs(OUT, exist_ok=True)

model = mujoco.MjModel.from_xml_path(XML)
data = mujoco.MjData(model)

# settle slightly bent legs? keep qpos0 (XML defaults) - robot starts standing at z=0.78
mujoco.mj_forward(model, data)

renderer = mujoco.Renderer(model, height=1000, width=1778)


def lookat_from_angles(azim, elev, dist=2.6, target=(0, 0, 0.75)):
    az = np.deg2rad(azim)
    el = np.deg2rad(elev)
    t = np.array(target)
    cam = t + dist * np.array([np.cos(el) * np.sin(az), np.cos(el) * np.cos(az), np.sin(el)])
    return cam, t


def make_cam(azim, elev, dist, target):
    c = mujoco.MjvCamera()
    c.type = mujoco.mjtCamera.mjCAMERA_FREE
    c.lookat[:] = target
    c.distance = dist
    c.azimuth = azim
    c.elevation = elev
    return c


views = [
    ("01_front", 90, 10, 2.6, (0, 0, 0.75)),
    ("02_back", -90, 10, 2.6, (0, 0, 0.75)),
    ("03_left_side", 0, 5, 2.6, (0, 0, 0.75)),
    ("04_right_side", 180, 5, 2.6, (0, 0, 0.75)),
    ("05_isometric_front_left", 45, 30, 2.4, (0, 0, 0.75)),
    ("06_isometric_back_right", -135, 30, 2.4, (0, 0, 0.75)),
    ("07_top", 90, 80, 2.4, (0, 0, 0.75)),
]

scene_option = mujoco.MjvOption()
for cam_name, az, el, dist, target in views:
    renderer.update_scene(data, camera=make_cam(az, el, dist, target), scene_option=scene_option)
    img = renderer.render()
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, f"{cam_name}.png"))
    print("rendered", cam_name)

# closeups
closeups = [
    ("08_torso_closeup", 45, 25, 0.9, (0, 0, 1.15)),
    ("09_left_leg_closeup", 20, 15, 1.0, (-0.05, 0.06, 0.35)),
    ("10_left_arm_closeup", -70, 10, 0.7, (-0.15, 0.25, 1.1)),
    ("11_hip_module_closeup", 30, 40, 0.6, (-0.05, 0.07, 0.65)),
]
for cam_name, az, el, dist, target in closeups:
    renderer.update_scene(data, camera=make_cam(az, el, dist, target), scene_option=scene_option)
    img = renderer.render()
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, f"{cam_name}.png"))
    print("rendered", cam_name)
renderer.close()

# ---- parts / actuators breakdown ----
def parse_urdf(path):
    tree = ET.parse(path)
    root = tree.getroot()
    links = {}
    for link in root.findall("link"):
        name = link.get("name")
        inertial = link.find("inertial")
        mass = None
        if inertial is not None:
            mass_el = inertial.find("mass")
            if mass_el is not None:
                mass = float(mass_el.get("value"))
        links[name] = {"mass_kg": mass}
    joints = []
    for joint in root.findall("joint"):
        jname = joint.get("name")
        jtype = joint.get("type")
        parent = joint.find("parent").get("link")
        child = joint.find("child").get("link")
        limit = joint.find("limit")
        lo = float(limit.get("lower")) if limit is not None and limit.get("lower") not in (None, "-1e+16", "-3.14159265358979") else None
        hi = float(limit.get("upper")) if limit is not None and limit.get("upper") not in (None, "1e+16", "3.14159265358979") else None
        eff = float(limit.get("effort")) if limit is not None and limit.get("effort") else None
        vel = float(limit.get("velocity")) if limit is not None and limit.get("velocity") else None
        axis_el = joint.find("axis")
        axis = axis_el.get("xyz") if axis_el is not None else None
        joints.append({"name": jname, "type": jtype, "parent": parent, "child": child,
                       "axis": axis, "lower": lo, "upper": hi,
                       "max_torque_Nm": eff, "max_speed_rad_s": vel})
    return links, joints

links, joints = parse_urdf(os.path.join(os.path.dirname(__file__), "RP1_description", "urdf", "rp1.urdf"))
total_mass = sum(v["mass_kg"] or 0 for v in links.values())

print("\n==== RP1 structure summary ====")
print("mesh visual links (from MJCF geom names):", model.nmesh)
print("bodies:", model.nbody - 1)
print("revolute joints:", sum(1 for j in joints if j["type"] == "revolute"))
print("total mass: %.2f kg" % total_mass)
print("\n---- Actuators (from rp1.urdf effort/velocity limits) ----")
for j in joints:
    if j["type"] != "revolute":
        continue
    lim = ""
    if j["lower"] is not None and j["upper"] is not None:
        lim = f"[{np.degrees(j['lower']):7.1f}, {np.degrees(j['upper']):7.1f}] deg"
    print(f"{j['name']:<28} axis={str(j['axis']):<12} range={lim:<26} torque={j['max_torque_Nm']} Nm  speed={j['max_speed_rad_s']} rad/s")

print("\n---- Link masses (rp1.urdf) ----")
for name, v in links.items():
    print(f"{name:<32} {v['mass_kg']:.3f} kg")
