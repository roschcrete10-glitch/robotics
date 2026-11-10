import xml.etree.ElementTree as ET
import os

SRC = os.path.join("RP1_description", "mjcf", "robot.xml")
DST = os.path.join("RP1_description", "mjcf", "rp1_servo.xml")

tree = ET.parse(SRC)
root = tree.getroot()

act = root.find("actuator")
for motor in list(act.findall("motor")):
    name = motor.get("name")
    ctrl = motor.get("ctrlrange")
    act.remove(motor)
    pos = ET.Element("position")
    pos.set("class", "RP1")
    for key in ("gear", "ctrlrange", "name", "joint", "class"):
        val = motor.get(key)
        if val:
            pos.set(key, val)
    # stiffness per torque class (Nm / rad err), damping
    parts = ESTIMATED = {
        "hip_pitch": 500, "hip_roll": 500, "knee": 500,
        "waist": 400, "hip_yaw": 220,
        "ankle": 260, "shoulder_pitch": 180, "shoulder_roll": 120,
        "shoulder_yaw": 120, "elbow": 120, "wrist": 60,
    }
    kp = 40
    for tag, v in ESTIMATED.items():
        if tag in name:
            kp = v
    pos.set("kp", str(kp))
    pos.set("dampratio", "1.4")
    act.append(pos)

tree.write(DST, encoding="utf-8", xml_declaration=True)
print("wrote", DST, "with", len(act.findall("position")), "position actuators")
