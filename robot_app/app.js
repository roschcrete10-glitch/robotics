import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { STLLoader } from './vendor/three/STLLoader.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';

const $ = (id) => document.getElementById(id);
const WHITE = 0xf1f3f6, BLUE = 0x1450eb, LOGO = 0x0a3c96;
const MESH_DIR = '../RP1_description/meshes/';
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

const PARTS = [
  { name: 'base_link', label: 'Pelvis · base_link', parent: null, pos: [0, 0, 0.78], mass: 3.295, joint: null, com: [-0.0379, -0.003, -0.0448],
    meshes: [['base_link.STL', WHITE], ['base_link_hip_flange_blue.STL', BLUE]],
    ex: { dir: [0, 0, 0], dist: 0 },
    hit: [[-0.03, 0, -0.10, -0.03, 0, 0.05, 0.075], [-0.038, 0.064, -0.115, -0.038, 0.064, -0.03, 0.062], [-0.038, -0.064, -0.115, -0.038, -0.064, -0.03, 0.062]] },

  { name: 'left_hip_pitch_link', label: 'Hip pitch · L', parent: 'base_link', pos: [-0.03843, 0.062987, -0.051639], mass: 1.839, joint: { name: 'left_hip_pitch_joint', axis: [0, 1, 0], lo: -163.9, hi: 163.9, T: 140 }, com: [-0.0033, 0.0589, -0.0577],
    meshes: [['left_hip_pitch_link.STL', BLUE]],
    ex: { dir: [0.0, 0.78, 0.62], dist: 0.42 },
    hit: [[-0.01122, 0.06756, -0.0689, -0.01122, 0.0507, -0.01118, 0.0497]] },
  { name: 'left_hip_roll_link', label: 'Hip roll · L', parent: 'left_hip_pitch_link', pos: [0.031915, 0.061254, -0.060672], mass: 1.473, joint: { name: 'left_hip_roll_joint', axis: [1, 0, 0], lo: -42.4, hi: 149.0, T: 140 }, com: [-0.0052, 0, -0.0808],
    meshes: [['left_hip_roll_link.STL', WHITE]],
    ex: { dir: [0.05, 0.95, -0.28], dist: 0.55 },
    hit: [[-0.0127, 0, -0.07578, -0.0127, 0, -0.00658, 0.05622]] },
  { name: 'left_hip_yaw_link', label: 'Hip yaw · L', parent: 'left_hip_roll_link', pos: [-0.012698, 0, -0.129], mass: 2.483, joint: { name: 'left_hip_yaw_joint', axis: [0, 0, -1], lo: -158.1, hi: 158.1, T: 55 }, com: [-0.0196, -0.0002, -0.1238],
    meshes: [['left_hip_yaw_link.STL', WHITE]],
    ex: { dir: [0.1, 0.72, -0.68], dist: 0.55 },
    hit: [[-0.03046, 0, -0.16235, -0.00001, 0, -0.05622, 0.05622]] },
  { name: 'left_knee_link', label: 'Knee · L', parent: 'left_hip_yaw_link', pos: [-0.033201, -0.030809, -0.16509], mass: 2.557, joint: { name: 'left_knee_joint', axis: [0, -1, 0], lo: -162.2, hi: 3.4, T: 140 }, com: [0.0311, 0.0305, -0.1336],
    meshes: [['left_knee_link.STL', WHITE]],
    ex: { dir: [0.08, 0.42, -0.9], dist: 0.6 },
    hit: [[0.033, 0.03081, -0.145, 0.003, 0.03081, -0.004, 0.052], [0.027, 0.03081, -0.278, 0.033, 0.03081, -0.185, 0.0405]] },
  { name: 'left_ankle_pitch_link', label: 'Ankle pitch · L', parent: 'left_knee_link', pos: [0.03131, 0.030811, -0.30533], mass: 0.166, joint: { name: 'left_ankle_pitch_joint', axis: [0, 1, 0], lo: -44.7, hi: 35.0, T: 64 }, com: [0.0013, 0, -0.0132],
    meshes: [['left_ankle_pitch_link.STL', WHITE]],
    ex: { dir: [0.06, 0.2, -0.97], dist: 0.55 },
    hit: [[-0.00145, 0, -0.00614, 0.00959, 0, -0.01051, 0.0215]] },
  { name: 'left_ankle_roll_link', label: 'Foot · L', parent: 'left_ankle_pitch_link', pos: [0.013067, 0, -0.018922], mass: 0.643, joint: { name: 'left_ankle_roll_joint', axis: [1, 0, 0.0036], lo: -14.9, hi: 14.9, T: 64 }, com: [0.0087, 0, -0.0216], foot: true,
    meshes: [['left_ankle_roll_link_visual_white.STL', WHITE], ['left_ankle_roll_detail_blue.STL', BLUE]],
    ex: { dir: [0, 0, -1], dist: 0.5 },
    hit: [[0.03, -0.03, -0.035, 0.09, -0.03, -0.035, 0.01], [-0.065, -0.02, -0.035, 0.11, -0.02, -0.035, 0.01],
      [-0.0775, -0.01, -0.035, 0.1225, -0.01, -0.035, 0.01], [-0.0825, 0, -0.035, 0.1275, 0, -0.035, 0.01],
      [-0.0775, 0.01, -0.035, 0.1225, 0.01, -0.035, 0.01], [-0.065, 0.02, -0.035, 0.11, 0.02, -0.035, 0.01],
      [0.03, 0.03, -0.035, 0.09, 0.03, -0.035, 0.01]] },

  { name: 'right_hip_pitch_link', label: 'Hip pitch · R', parent: 'base_link', pos: [-0.03843, -0.069013, -0.051639], mass: 1.842, joint: { name: 'right_hip_pitch_joint', axis: [0, -1, 0], lo: -163.9, hi: 163.9, T: 140 }, com: [-0.0033, -0.0587, -0.0576],
    meshes: [['right_hip_pitch_link.STL', BLUE]],
    ex: { dir: [0.0, -0.78, 0.62], dist: 0.42 },
    hit: [[-0.01122, -0.06756, -0.0689, -0.01122, -0.0507, -0.01118, 0.0497]] },
  { name: 'right_hip_roll_link', label: 'Hip roll · R', parent: 'right_hip_pitch_link', pos: [0.031915, -0.061254, -0.060672], mass: 1.473, joint: { name: 'right_hip_roll_joint', axis: [1, 0, 0], lo: -149.0, hi: 42.4, T: 140 }, com: [-0.0052, 0, -0.0808],
    meshes: [['right_hip_roll_link.STL', WHITE]],
    ex: { dir: [0.05, -0.95, -0.28], dist: 0.55 },
    hit: [[-0.0127, 0, -0.07578, -0.0127, 0, -0.00658, 0.05622]] },
  { name: 'right_hip_yaw_link', label: 'Hip yaw · R', parent: 'right_hip_roll_link', pos: [-0.012698, 0, -0.129], mass: 2.483, joint: { name: 'right_hip_yaw_joint', axis: [0, 0, -1], lo: -158.1, hi: 158.1, T: 55 }, com: [-0.0196, 0.0002, -0.1238],
    meshes: [['right_hip_yaw_link.STL', WHITE]],
    ex: { dir: [0.1, -0.72, -0.68], dist: 0.55 },
    hit: [[-0.03046, 0, -0.16235, -0.00001, 0, -0.05622, 0.05622]] },
  { name: 'right_knee_link', label: 'Knee · R', parent: 'right_hip_yaw_link', pos: [-0.033201, 0.030809, -0.16509], mass: 2.557, joint: { name: 'right_knee_joint', axis: [0, 1, 0], lo: -3.4, hi: 162.2, T: 140 }, com: [0.0312, -0.0307, -0.134],
    meshes: [['right_knee_link.STL', WHITE]],
    ex: { dir: [0.08, -0.42, -0.9], dist: 0.6 },
    hit: [[0.033, -0.03081, -0.145, 0.003, -0.03081, -0.004, 0.052], [0.027, -0.03081, -0.278, 0.033, -0.03081, -0.185, 0.0405]] },
  { name: 'right_ankle_pitch_link', label: 'Ankle pitch · R', parent: 'right_knee_link', pos: [0.03131, -0.030809, -0.30533], mass: 0.166, joint: { name: 'right_ankle_pitch_joint', axis: [0, 1, 0], lo: -44.7, hi: 35.0, T: 64 }, com: [0.0013, 0, -0.0132],
    meshes: [['right_ankle_pitch_link.STL', WHITE]],
    ex: { dir: [0.06, -0.2, -0.97], dist: 0.55 },
    hit: [[-0.00145, 0, -0.00614, 0.00959, 0, -0.01051, 0.0215]] },
  { name: 'right_ankle_roll_link', label: 'Foot · R', parent: 'right_ankle_pitch_link', pos: [0.013067, 0, -0.018922], mass: 0.643, joint: { name: 'right_ankle_roll_joint', axis: [1, 0, 0.0036], lo: -14.9, hi: 14.9, T: 64 }, com: [0.0087, 0, -0.0216], foot: true,
    meshes: [['right_ankle_roll_link_visual_white.STL', WHITE], ['right_ankle_roll_detail_blue.STL', BLUE]],
    ex: { dir: [0, 0, -1], dist: 0.5 },
    hit: [[0.03, 0.03, -0.035, 0.09, 0.03, -0.035, 0.01], [-0.065, 0.02, -0.035, 0.11, 0.02, -0.035, 0.01],
      [-0.0775, 0.01, -0.035, 0.1225, 0.01, -0.035, 0.01], [-0.0825, 0, -0.035, 0.1275, 0, -0.035, 0.01],
      [-0.0775, -0.01, -0.035, 0.1225, -0.01, -0.035, 0.01], [-0.065, -0.02, -0.035, 0.11, -0.02, -0.035, 0.01],
      [0.03, -0.03, -0.035, 0.09, -0.03, -0.035, 0.01]] },

  { name: 'waist_roll_link', label: 'Waist roll', parent: 'base_link', pos: [-0.00758, -0.00301, 0.05298], mass: 1.532, joint: { name: 'waist_roll_joint', axis: [1, 0, 0], lo: -40.1, hi: 40.1, T: 140 }, com: [-0.0306, 0, -0.0003],
    meshes: [['waist_roll_link.STL', BLUE]],
    ex: { dir: [0, 0, -1], dist: 0.26 },
    hit: [[-0.03686, -0.01336, -0.01336, -0.03686, -0.01336, 0.02536, 0.04164], [-0.03686, 0.01336, -0.01336, -0.03686, 0.01336, 0.02536, 0.04164]] },
  { name: 'waist_yaw_link', label: 'Torso · waist yaw', parent: 'waist_roll_link', pos: [-0.030845, 0, 0.068], mass: 8.343, joint: { name: 'waist_yaw_joint', axis: [0, 0, -1], lo: -166.8, hi: 166.8, T: 140 }, com: [-0.0014, 0, 0.1289],
    meshes: [['waist_yaw_link_visual_white.STL', WHITE], ['waist_yaw_logo_visual_blue.STL', LOGO]],
    ex: { dir: [0, 0, 1], dist: 0.62 },
    hit: [[0.01, 0, 0.0394, 0.01, 0, 0.08, 0.09], [-0.0244, 0, 0.145, -0.0244, 0, 0.21, 0.12], [-0.0185, 0, 0.335, -0.0185, 0, 0.33668, 0.088]] },

  { name: 'left_shoulder_pitch_link', label: 'Shoulder pitch · L', parent: 'waist_yaw_link', pos: [0, 0.116496, 0.198487], mass: 0.829, joint: { name: 'left_shoulder_pitch_joint', axis: [0, 0.99619, 0.087156], lo: -194.8, hi: 134.6, T: 55 }, com: [-0.0023, 0.0588, -0.0115],
    meshes: [['left_shoulder_pitch_link.STL', BLUE]],
    ex: { dir: [0.3, 0.8, 0.5], dist: 0.5 },
    hit: [[-0.00326, 0.03582, -0.00238, -0.00326, 0.06284, -0.0121, 0.03808]] },
  { name: 'left_shoulder_roll_link', label: 'Shoulder roll · L', parent: 'left_shoulder_pitch_link', pos: [0.028743, 0.065349, -0.014609], mass: 0.769, joint: { name: 'left_shoulder_roll_joint', axis: [1, 0, 0], lo: -26.9, hi: 166.2, T: 32 }, com: [-0.0161, 0, -0.0661],
    meshes: [['left_shoulder_roll_link.STL', WHITE]],
    ex: { dir: [0.2, 0.95, 0.15], dist: 0.65 },
    hit: [[-0.01906, 0, -0.068, -0.01906, 0, -0.00656, 0.04]] },
  { name: 'left_shoulder_yaw_link', label: 'Shoulder yaw · L', parent: 'left_shoulder_roll_link', pos: [-0.019057, 0, -0.105], mass: 0.952, joint: { name: 'left_shoulder_yaw_joint', axis: [0, 0, -1], lo: -164.4, hi: 164.4, T: 32 }, com: [0.0145, -0.0011, -0.0859],
    meshes: [['left_shoulder_yaw_link.STL', WHITE]],
    ex: { dir: [0.12, 0.94, -0.32], dist: 0.78 },
    hit: [[0.01816, 0.00008, -0.1015, 0.00008, 0.00008, -0.01708, 0.04008]] },
  { name: 'left_elbow_link', label: 'Elbow · L', parent: 'left_shoulder_yaw_link', pos: [0.020796, -0.031888, -0.10414], mass: 0.779, joint: { name: 'left_elbow_joint', axis: [0, -1, 0], lo: -91.7, hi: 71.0, T: 32 }, com: [0.0722, 0.0311, -0.0181],
    meshes: [['left_elbow_link.STL', WHITE]],
    ex: { dir: [0.1, 0.9, -0.42], dist: 0.9 },
    hit: [[0.00487, 0.03186, -0.00484, 0.07959, 0.03186, -0.01404, 0.0422]] },
  { name: 'left_wrist_roll_link', label: 'Wrist roll · L', parent: 'left_elbow_link', pos: [0.116093, 0.031859, -0.018793], mass: 0.161, joint: { name: 'left_wrist_roll_joint', axis: [1, 0, 0], lo: -146.7, hi: 146.7, T: 32 }, com: [0.0183, 0, 0.0103],
    meshes: [['left_wrist_roll_link.STL', WHITE]],
    ex: { dir: [0.08, 0.8, -0.6], dist: 1.02 },
    hit: [[0.01445, 0, 0, 0.04795, 0, 0, 0.0365]] },
  { name: 'left_wrist_yaw_link', label: 'Wrist yaw · L', parent: 'left_wrist_roll_link', pos: [0.053, 0, 0.020701], mass: 1.035, joint: { name: 'left_wrist_yaw_joint', axis: [0, 0, -1], lo: -69.9, hi: 69.9, T: 32 }, com: [0.0308, 0.0004, -0.0279],
    meshes: [['left_wrist_yaw_link.STL', BLUE]],
    ex: { dir: [0.08, 0.6, -0.8], dist: 1.08 },
    hit: [[0, 0, -0.02868, 0.06213, 0, -0.02538, 0.03245]] },
  { name: 'left_wrist_pitch_link', label: 'Wrist pitch · L', parent: 'left_wrist_yaw_link', pos: [0.062136, 0.029458, -0.026067], mass: 0.073, joint: { name: 'left_wrist_pitch_joint', axis: [0, 1, 0], lo: -69.9, hi: 69.9, T: 32 }, com: [0.023, -0.0095, 0],
    meshes: [['left_wrist_pitch_link.STL', WHITE]],
    ex: { dir: [0.06, 0.45, -0.9], dist: 1.14 },
    hit: [[0, -0.023, 0, 0.042, -0.02372, 0, 0.031]] },

  { name: 'right_shoulder_pitch_link', label: 'Shoulder pitch · R', parent: 'waist_yaw_link', pos: [0, -0.116496, 0.198487], mass: 0.829, joint: { name: 'right_shoulder_pitch_joint', axis: [0, -0.99619, 0.087156], lo: -134.6, hi: 194.8, T: 55 }, com: [-0.0023, -0.0586, -0.0115],
    meshes: [['right_shoulder_pitch_link.STL', BLUE]],
    ex: { dir: [0.3, -0.8, 0.5], dist: 0.5 },
    hit: [[-0.00326, -0.06284, -0.0121, -0.00326, -0.03582, -0.00238, 0.03808]] },
  { name: 'right_shoulder_roll_link', label: 'Shoulder roll · R', parent: 'right_shoulder_pitch_link', pos: [0.028743, -0.065349, -0.014609], mass: 0.804, joint: { name: 'right_shoulder_roll_joint', axis: [1, 0, 0], lo: -166.2, hi: 26.9, T: 32 }, com: [-0.0163, 0, -0.0681],
    meshes: [['right_shoulder_roll_link.STL', WHITE]],
    ex: { dir: [0.2, -0.95, 0.15], dist: 0.65 },
    hit: [[-0.01906, 0, -0.068, -0.01906, 0, -0.00656, 0.04]] },
  { name: 'right_shoulder_yaw_link', label: 'Shoulder yaw · R', parent: 'right_shoulder_roll_link', pos: [-0.019057, 0, -0.105], mass: 0.952, joint: { name: 'right_shoulder_yaw_joint', axis: [0, 0, -1], lo: -164.4, hi: 164.4, T: 32 }, com: [0.0143, 0.0011, -0.0859],
    meshes: [['right_shoulder_yaw_link.STL', WHITE]],
    ex: { dir: [0.12, -0.94, -0.32], dist: 0.78 },
    hit: [[0.01816, -0.00008, -0.1015, 0.00008, -0.00008, -0.01708, 0.04008]] },
  { name: 'right_elbow_link', label: 'Elbow · R', parent: 'right_shoulder_yaw_link', pos: [0.020796, 0.031888, -0.10414], mass: 0.779, joint: { name: 'right_elbow_joint', axis: [0, 1, 0], lo: -91.7, hi: 71.0, T: 32 }, com: [0.0722, -0.0309, -0.018],
    meshes: [['right_elbow_link.STL', WHITE]],
    ex: { dir: [0.1, -0.9, -0.42], dist: 0.9 },
    hit: [[0.00487, -0.03186, -0.00484, 0.07959, -0.03186, -0.01404, 0.0422]] },
  { name: 'right_wrist_roll_link', label: 'Wrist roll · R', parent: 'right_elbow_link', pos: [0.116093, -0.031859, -0.018793], mass: 0.161, joint: { name: 'right_wrist_roll_joint', axis: [1, 0, 0], lo: -146.7, hi: 146.7, T: 32 }, com: [0.0183, 0, 0.0103],
    meshes: [['right_wrist_roll_link.STL', WHITE]],
    ex: { dir: [0.08, -0.8, -0.6], dist: 1.02 },
    hit: [[0.01445, 0, 0, 0.04795, 0, 0, 0.0365]] },
  { name: 'right_wrist_yaw_link', label: 'Wrist yaw · R', parent: 'right_wrist_roll_link', pos: [0.053, 0, 0.020701], mass: 1.035, joint: { name: 'right_wrist_yaw_joint', axis: [0, 0, -1], lo: -69.9, hi: 69.9, T: 32 }, com: [0.0308, -0.0004, -0.0279],
    meshes: [['right_wrist_yaw_link.STL', BLUE]],
    ex: { dir: [0.08, -0.6, -0.8], dist: 1.08 },
    hit: [[0, 0, -0.02868, 0.06213, 0, -0.02567, 0.03245]] },
  { name: 'right_wrist_pitch_link', label: 'Wrist pitch · R', parent: 'right_wrist_yaw_link', pos: [0.062136, -0.029458, -0.026067], mass: 0.072, joint: { name: 'right_wrist_pitch_joint', axis: [0, -1, 0], lo: -69.9, hi: 69.9, T: 32 }, com: [0.0228, 0.0097, 0],
    meshes: [['right_wrist_pitch_link.STL', WHITE]],
    ex: { dir: [0.06, -0.45, -0.9], dist: 1.14 },
    hit: [[0, 0.023, 0, 0.042, 0.02372, 0, 0.031]] }
];

const ASSEMBLE_ORDER = [
  'base_link',
  'left_hip_pitch_link', 'right_hip_pitch_link',
  'left_hip_roll_link', 'right_hip_roll_link',
  'left_hip_yaw_link', 'right_hip_yaw_link',
  'left_knee_link', 'right_knee_link',
  'left_ankle_pitch_link', 'right_ankle_pitch_link',
  'left_ankle_roll_link', 'right_ankle_roll_link',
  'waist_roll_link', 'waist_yaw_link',
  'left_shoulder_pitch_link', 'right_shoulder_pitch_link',
  'left_shoulder_roll_link', 'right_shoulder_roll_link',
  'left_shoulder_yaw_link', 'right_shoulder_yaw_link',
  'left_elbow_link', 'right_elbow_link',
  'left_wrist_roll_link', 'right_wrist_roll_link',
  'left_wrist_yaw_link', 'right_wrist_yaw_link',
  'left_wrist_pitch_link', 'right_wrist_pitch_link'
];

const GROUP_DEFS = [
  ['Left leg (6 DoF)', ['left_hip_pitch', 'left_hip_roll', 'left_hip_yaw', 'left_knee', 'left_ankle_pitch', 'left_ankle_roll']],
  ['Right leg (6 DoF)', ['right_hip_pitch', 'right_hip_roll', 'right_hip_yaw', 'right_knee', 'right_ankle_pitch', 'right_ankle_roll']],
  ['Waist (2 DoF)', ['waist_roll', 'waist_yaw']],
  ['Left arm (7 DoF)', ['left_shoulder_pitch', 'left_shoulder_roll', 'left_shoulder_yaw', 'left_elbow', 'left_wrist_roll', 'left_wrist_yaw', 'left_wrist_pitch']],
  ['Right arm (7 DoF)', ['right_shoulder_pitch', 'right_shoulder_roll', 'right_shoulder_yaw', 'right_elbow', 'right_wrist_roll', 'right_wrist_yaw', 'right_wrist_pitch']]
];

const POSES = {
  Stand: { map: {} },
  Squat: { map: { left_hip_pitch_joint: -0.85, left_knee_joint: -1.4, left_ankle_pitch_joint: -0.55, right_hip_pitch_joint: 0.85, right_knee_joint: 1.4, right_ankle_pitch_joint: -0.55 } },
  'T-pose': { map: { left_shoulder_roll_joint: 1.57, right_shoulder_roll_joint: -1.57 } },
  Kick: { map: { left_hip_pitch_joint: -1.05, left_knee_joint: 0, left_ankle_pitch_joint: -0.25 } },
  Bow: { map: { waist_roll_joint: 0.35, left_shoulder_pitch_joint: -0.6, right_shoulder_pitch_joint: 0.6, left_elbow_joint: 0.45, right_elbow_joint: -0.45 } },
  Wave: { map: { right_shoulder_pitch_joint: 0.7, right_shoulder_roll_joint: -0.55, right_elbow_joint: 1.4 }, osc: { right_wrist_yaw_joint: (t) => 0.6 + 0.55 * Math.sin(t * 3.4) } }
};

const CAM_PRESETS = {
  Front: [2.5, 0, 1.5], Back: [-2.5, 0, 1.5],
  Left: [0, 2.8, 1.35], Right: [0, -2.8, 1.35],
  Top: [0.02, 0, 3.9], Iso: [2.4, 2.1, 1.5]
};

const ROOT_IDX = 0;
const byName = {};
PARTS.forEach(p => {
  p.children = []; p.assembled = true; p.s = 0; p.angle = p.joint ? 0 : 0;
  p.mats = []; p.hitMeshes = []; p.axisMesh = null;
  p.worldM = new THREE.Matrix4();
  p.fkPos = new THREE.Vector3();
  p.fkQuat = new THREE.Quaternion();
  p.off = new THREE.Vector3();
  p.group = null;
  byName[p.name] = p;
});
PARTS.forEach(p => { p.parentRef = p.parent ? byName[p.parent] : null; if (p.parentRef) p.parentRef.children.push(p); });
PARTS.forEach(p => { p.exDir = new THREE.Vector3(...p.ex.dir).normalize().multiplyScalar(p.ex.dist); p.centerLocal = new THREE.Vector3(); p.center = new THREE.Vector3(); });
const ROOT = byName['base_link'];
const FOOT_PARTS = PARTS.filter(p => p.foot);
const JOINT_PARTS = PARTS.filter(p => p.joint);
const TOTAL_MASS = PARTS.reduce((a, p) => a + p.mass, 0);

let renderer, scene, camera, controls, raycaster, loader, robotRoot;
let comSphere, comLine, comGeom;
const hitList = [];
const labels = {};
const elTweens = [];
const poseTweens = [];
let hoverPart = null, selPart = null;
let gain = 1, labelsOn = false, spin = true;
let showAxes = false, showColliders = false, showCom = false, groundOn = true;
let currentPose = 'Stand';
let groundZ = -0.0493;
let camAnim = null, introActive = true, introT = 0;
const camFrom = new THREE.Vector3(4.6, 4.0, 2.75), camTo = new THREE.Vector3(2.4, 2.1, 1.5);
const clock = { t: performance.now() };
const mouse = new THREE.Vector2(-2, -2);
const V = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3();
const Q = new THREE.Quaternion();
const M1 = new THREE.Matrix4(), M2 = new THREE.Matrix4(), ID = new THREE.Matrix4();
const Y_UP = new THREE.Vector3(0, 1, 0);

function ease(t) { return 1 - Math.pow(1 - t, 3); }

function elTween(p, to, dur, delay = 0) {
  for (let i = elTweens.length - 1; i >= 0; i--) if (elTweens[i].p === p) elTweens.splice(i, 1);
  elTweens.push({ p, from: p.s, to, t0: performance.now() + delay, dur });
}
function poseTween(p, toRad, dur, delay = 0) {
  for (let i = poseTweens.length - 1; i >= 0; i--) if (poseTweens[i].p === p) poseTweens.splice(i, 1);
  poseTweens.push({ p, from: p.angle, to: toRad, t0: performance.now() + delay, dur });
  killPose(p);
}
function killPose(p) {
  const el = $('j_' + p.joint.name);
  if (el) $('v_' + p.joint.name).textContent = fmtDeg(p.angle);
}

function subtree(p, out = []) { out.push(p); p.children.forEach(c => subtree(c, out)); return out; }
function chainUp(p) { const c = []; let q = p; while (q) { if (!q.assembled) c.push(q); q = q.parentRef; } return c.reverse(); }

function explodeFrom(p, stagger = 55) {
  subtree(p).forEach((q, i) => { if (q.assembled) { q.assembled = false; elTween(q, 1, 520, i * stagger); } });
  refreshPanel();
}
function assembleAt(p, stagger = 50) {
  chainUp(p).concat(p.assembled ? [] : [p]).forEach((q, i) => { if (!q.assembled) { q.assembled = true; elTween(q, 0, 440, i * stagger); } });
  refreshPanel();
}

function fkWalk(p, parentM, inhOff) {
  M1.makeTranslation(p.pos[0], p.pos[1], p.pos[2]);
  if (p.joint) {
    V.set(p.joint.axis[0], p.joint.axis[1], p.joint.axis[2]).normalize();
    Q.setFromAxisAngle(V, p.angle);
    M2.makeRotationFromQuaternion(Q);
    M1.multiply(M2);
  }
  p.worldM.copy(parentM || ID).multiply(M1);
  p.fkPos.setFromMatrixPosition(p.worldM);
  p.fkQuat.setFromRotationMatrix(p.worldM);

  p.off.copy(inhOff);
  if (!p.assembled) p.off.addScaledVector(p.exDir, p.s * gain);
  p.group.position.copy(p.fkPos).add(p.off);
  p.group.quaternion.copy(p.fkQuat);
  p.center.copy(p.centerLocal).applyQuaternion(p.fkQuat).add(p.group.position);
  for (const c of p.children) fkWalk(c, p.worldM, p.off);
}

function computeGround() {
  let minZ = 99;
  for (const f of FOOT_PARTS) {
    for (const h of f.hitMeshes) {
      const ha = f.localHitA.get(h), hb = f.localHitB.get(h);
      V.copy(ha).applyQuaternion(f.fkQuat).add(f.fkPos);
      V2.copy(hb).applyQuaternion(f.fkQuat).add(f.fkPos);
      minZ = Math.min(minZ, V.z, V2.z);
    }
  }
  if (minZ > 90) return -0.0493;
  const shift = Math.min(0.05, Math.max(-0.62, -minZ));
  return shift;
}

function setHover(p) {
  if (hoverPart === p) return;
  if (hoverPart) hoverPart.mats.forEach(m => { if (selPart !== hoverPart) m.emissive.setHex(0x000000); });
  hoverPart = p;
  if (hoverPart) hoverPart.mats.forEach(m => m.emissive.setHex(selPart === hoverPart ? 0x1f4d8f : 0x1a3a66));
  document.body.style.cursor = hoverPart ? 'pointer' : '';
}

function select(p) {
  if (selPart) selPart.mats.forEach(m => m.emissive.setHex(hoverPart === selPart ? 0x1a3a66 : 0x000000));
  selPart = p;
  if (selPart) selPart.mats.forEach(m => m.emissive.setHex(0x1f4d8f));
  syncAxes();
  refreshPanel();
}

function syncAxes() {
  PARTS.forEach(p => { if (p.axisMesh) p.axisMesh.visible = showAxes || (selPart === p && !!p.joint); });
}
function syncColliders() {
  PARTS.forEach(p => p.hitMeshes.forEach(h => { h.material.visible = showColliders; }));
}

function applyPose(name) {
  currentPose = name;
  $('poseName').textContent = name.toLowerCase();
  const def = POSES[name];
  JOINT_PARTS.forEach((p, i) => {
    const t = def.map[p.joint.name] ?? 0;
    poseTween(p, t, 620, 0);
  });
}

function fmtDeg(rad) { return (rad * R2D).toFixed(1) + '°'; }

function refreshPanel() {
  const n = PARTS.filter(p => p.assembled).length;
  $('meta').textContent = `${PARTS.length} parts · ${TOTAL_MASS.toFixed(1)} kg · 28 servo axes · ${n}/${PARTS.length} assembled`;
  PARTS.forEach(p => {
    const li = $(p.name);
    if (li) {
      li.children[2].classList.toggle('ok', p.assembled);
      li.classList.toggle('sel', p === selPart);
      li.classList.toggle('busy', elTweens.some(t => t.p === p));
    }
  });
  const c = $('card');
  if (!selPart) { c.style.display = 'none'; return; }
  c.style.display = '';
  const p = selPart;
  let rows = `
    <div class="t">${p.label}</div>
    <div class="s">${p.name} · ${p.assembled ? '<span style="color:#39d98a">installed</span>' : '<span style="color:#ff9f43">floating</span>'}</div>
    <div class="row"><span class="k">mass</span><span class="v">${p.mass.toFixed(2)} kg</span></div>
    <div class="row"><span class="k">link CoM</span><span class="v">(${p.com.map(v => v.toFixed(3)).join(', ')}) m</span></div>`;
  if (p.joint) {
    const a = p.joint.axis.map(x => Math.abs(x) > 0.001 ? 1 : 0).join('');
    const ax = a === '100' ? 'X' : a === '010' ? 'Y' : a === '001' ? 'Z' : `${p.joint.axis.join(' ')}`;
    rows += `
    <div class="row"><span class="k">joint</span><span class="v">${p.joint.name}</span></div>
    <div class="row"><span class="k">axis</span><span class="v">${ax}</span></div>
    <div class="row"><span class="k">range</span><span class="v">${p.joint.lo.toFixed(1)}° … ${p.joint.hi.toFixed(1)}°</span></div>
    <div class="row"><span class="k">max torque</span><span class="v">${p.joint.T} N·m</span></div>
    <div class="row"><span class="k">angle now</span><span class="v">${fmtDeg(p.angle)}</span></div>`;
  } else {
    rows += `<div class="row"><span class="k">joint</span><span class="v">free joint (floating base)</span></div>`;
  }
  c.innerHTML = rows;
}

function buildList() {
  const ul = $('list');
  ASSEMBLE_ORDER.forEach((name, i) => {
    const p = byName[name];
    const li = document.createElement('li');
    li.id = name;
    li.innerHTML = `<span class="idx">${String(i + 1).padStart(2, '0')}</span><span class="nm">${p.label}</span><span class="dot" style="background:var(--ok)"></span>`;
    li.onclick = () => { select(p); if (p.assembled) explodeFrom(p); else assembleAt(p); };
    ul.appendChild(li);
  });
}

function buildJoints() {
  const host = $('joints');
  GROUP_DEFS.forEach(([title, bases], gi) => {
    const det = document.createElement('details');
    det.open = gi === 0;
    const sum = document.createElement('summary');
    sum.textContent = title;
    det.appendChild(sum);
    bases.forEach(base => {
      const p = byName[base + '_link'];
      const j = p.joint;
      const row = document.createElement('div');
      row.className = 'jrow';
      row.innerHTML = `<span class="jn">${p.label.replace(' · ', '·')}</span>
        <input id="j_${j.name}" type="range" min="${j.lo.toFixed(1)}" max="${j.hi.toFixed(1)}" step="0.5" value="0">
        <span class="jv" id="v_${j.name}">0.0°</span>`;
      det.appendChild(row);
      row.querySelector('input').addEventListener('input', (e) => {
        for (let i = poseTweens.length - 1; i >= 0; i--) if (poseTweens[i].p === p) poseTweens.splice(i, 1);
        if (POSES[currentPose] && POSES[currentPose].osc && POSES[currentPose].osc[j.name]) { currentPose = 'Stand'; $('poseName').textContent = 'custom'; }
        p.angle = parseFloat(e.target.value) * D2R;
        $('v_' + j.name).textContent = e.target.value + '°';
        if (currentPose !== 'Custom') { currentPose = 'Custom'; $('poseName').textContent = 'custom'; }
        if (selPart === p) refreshPanel();
      });
    });
    host.appendChild(det);
  });
}

function initScene() {
  const canvas = $('gl');
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  } catch (e) {
    $('fallback').style.display = 'flex'; $('loader').remove(); return false;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e13);
  scene.fog = new THREE.Fog(0x0a0e13, 7.5, 17);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.05, 60);
  camera.up.set(0, 0, 1);
  camera.position.copy(camFrom);

  controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0.72);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.55;
  controls.maxDistance = 8;
  controls.maxPolarAngle = 1.53;
  controls.autoRotate = spin;
  controls.autoRotateSpeed = 1.0;

  scene.add(new THREE.HemisphereLight(0x9db8ff, 0x2c2620, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3.2, 2.4, 4.6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -2.2; key.shadow.camera.right = 2.2;
  key.shadow.camera.top = 2.2; key.shadow.camera.bottom = -2.2;
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 14;
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5f8dff, 1.1);
  rim.position.set(-3, -1.2, 2.2);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 72),
    new THREE.MeshStandardMaterial({ color: 0x101720, roughness: 0.95, metalness: 0.02 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.PolarGridHelper(3.2, 12, 6, 72, 0x24344a, 0x18222e);
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.y = 0.001;
  scene.add(grid);

  robotRoot = new THREE.Group();
  robotRoot.position.z = groundZ;
  scene.add(robotRoot);
  comSphere = new THREE.Mesh(new THREE.SphereGeometry(0.023, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  comSphere.visible = false;
  robotRoot.add(comSphere);
  comGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  comLine = new THREE.Line(comGeom, new THREE.LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.55 }));
  comLine.visible = false;
  robotRoot.add(comLine);

  PARTS.forEach(p => {
    p.group = new THREE.Group();
    p.group.position.copy(p.pos);
    robotRoot.add(p.group);
    p.meshes.forEach(([file, color]) => {
      loader.load(MESH_DIR + file, (geo) => {
        const mat = new THREE.MeshStandardMaterial({
          color, roughness: color === WHITE ? 0.42 : 0.35,
          metalness: color === WHITE ? 0.18 : 0.3,
          envMapIntensity: 0.6
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true; mesh.receiveShadow = true;
        p.mats.push(mat);
        p.group.add(mesh);
      });
    });
    p.localHitA = new Map(); p.localHitB = new Map();
    p.hit.forEach(([x1, y1, z1, x2, y2, z2, r]) => {
      const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
      const dir = b.clone().sub(a); const len = dir.length();
      const geo = new THREE.CapsuleGeometry(r, len, 4, 10);
      const mat = new THREE.MeshBasicMaterial({ visible: false, color: 0xff5555, transparent: true, opacity: 0.18, depthWrite: false });
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(a).addScaledVector(dir, 0.5);
      m.quaternion.setFromUnitVectors(Y_UP, dir.clone().normalize());
      m.userData.part = p;
      hitList.push(m);
      p.hitMeshes.push(m);
      p.localHitA.set(m, a.clone()); p.localHitB.set(m, b.clone());
      p.group.add(m);
    });
    if (p.joint) {
      const axis = new THREE.Vector3(...p.joint.axis).normalize();
      const geo = new THREE.CylinderGeometry(0.006, 0.006, 0.30, 8);
      const mat = new THREE.MeshBasicMaterial({ color: 0x35d0ff });
      const m = new THREE.Mesh(geo, mat);
      m.quaternion.setFromUnitVectors(Y_UP, axis);
      const mid = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
      m.add(mid);
      m.visible = false;
      p.axisMesh = m;
      p.group.add(m);
    }
    const lb = document.createElement('div');
    lb.className = 'lbl';
    lb.textContent = p.label;
    $('labels').appendChild(lb);
    labels[p.name] = lb;
  });

  raycaster = new THREE.Raycaster();
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  let downXY = null;
  const tip = $('tip');
  canvas.addEventListener('pointerdown', (e) => { downXY = [e.clientX, e.clientY]; introActive = false; camAnim = null; });
  addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    tip.style.left = Math.min(e.clientX + 16, innerWidth - 260) + 'px';
    tip.style.top = Math.min(e.clientY + 14, innerHeight - 110) + 'px';
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!downXY) return;
    const moved = Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]);
    downXY = null;
    if (moved > 5 || e.button !== 0) return;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(hitList, false)[0];
    const p = hit && hit.object.userData.part;
    if (!p) return;
    introActive = false; camAnim = null;
    select(p);
    if (p.assembled) explodeFrom(p); else assembleAt(p);
  });
  canvas.addEventListener('pointerleave', () => setHover(null));

  buildList();
  buildJoints();
  refreshPanel();
  syncAxes(); syncColliders();
  return true;
}

function flyCam(pos) {
  camAnim = { from: camera.position.clone(), to: new THREE.Vector3(...pos), t0: performance.now(), dur: 700 };
}

function tick() {
  requestAnimationFrame(tick);
  const now = performance.now();
  let animDone = false;
  for (let i = elTweens.length - 1; i >= 0; i--) {
    const t = elTweens[i];
    const u = (now - t.t0) / t.dur;
    if (u < 0) { t.p.s = t.from; continue; }
    t.p.s = t.from + (t.to - t.from) * ease(Math.min(u, 1));
    if (u >= 1) { elTweens.splice(i, 1); animDone = true; }
  }
  if (animDone) refreshPanel();

  let poseDone = false;
  for (let i = poseTweens.length - 1; i >= 0; i--) {
    const t = poseTweens[i];
    const u = (now - t.t0) / t.dur;
    if (u < 0) continue;
    t.p.angle = t.from + (t.to - t.from) * ease(Math.min(u, 1));
    const jn = t.p.joint.name;
    $('j_' + jn).value = (t.p.angle * R2D).toFixed(1);
    $('v_' + jn).textContent = (t.p.angle * R2D).toFixed(1) + '°';
    if (u >= 1) { poseTweens.splice(i, 1); poseDone = true; }
  }
  if (poseDone && selPart) refreshPanel();

  const def = POSES[currentPose];
  if (def && def.osc) {
    const tsec = now / 1000;
    for (const [jn, fn] of Object.entries(def.osc)) {
      const p = JOINT_PARTS.find(q => q.joint.name === jn);
      if (p && !poseTweens.some(t => t.p === p)) {
        p.angle = fn(tsec);
        $('j_' + jn).value = (p.angle * R2D).toFixed(1);
        $('v_' + jn).textContent = (p.angle * R2D).toFixed(1) + '°';
      }
    }
  }

  gain = $('gain').value / 100;
  fkWalk(ROOT, null, ZERO);
  if (assetsReady && groundOn) groundZ = computeGround();
  robotRoot.position.z = groundZ;

  if (showCom) {
    V3.set(0, 0, 0);
    let cm = 0;
    for (const p of PARTS) {
      V.set(...p.com).applyQuaternion(p.fkQuat).add(p.fkPos);
      V3.addScaledVector(V, p.mass);
      cm += p.mass;
    }
    V3.multiplyScalar(1 / cm);
    comSphere.position.copy(V3);
    comGeom.setFromPoints([V3, new THREE.Vector3(V3.x, V3.y, 0)]);
    comLine.geometry.attributes.position.needsUpdate = true;
  }

  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(hitList, false)[0];
  setHover(hit ? hit.object.userData.part : null);
  refreshTip();

  if (camAnim) {
    const u = Math.min((now - camAnim.t0) / camAnim.dur, 1);
    camera.position.lerpVectors(camAnim.from, camAnim.to, ease(u));
    if (u >= 1) camAnim = null;
  }
  if (introActive) {
    introT = Math.min(introT + (now - clock.t) / 1400, 1);
    camera.position.lerpVectors(camFrom, camTo, ease(introT));
    if (introT >= 1) introActive = false;
  }
  clock.t = now;

  controls.update();
  updateLabels();
  renderer.render(scene, camera);
}
const ZERO = new THREE.Vector3();

function updateLabels() {
  if (!labelsOn) return;
  PARTS.forEach(p => {
    const lb = labels[p.name];
    V.copy(p.center).add(robotRoot.position);
    V.project(camera);
    if (V.z > 1 || V.z < -1) { lb.classList.add('hide'); return; }
    lb.classList.remove('hide');
    lb.classList.toggle('ok', p.assembled);
    lb.style.transform = `translate(${(V.x * 0.5 + 0.5) * innerWidth}px, ${(-V.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-50%)`;
  });
}

function refreshTip() {
  const tip = $('tip');
  if (!hoverPart) { tip.style.display = 'none'; return; }
  const p = hoverPart;
  tip.style.display = 'block';
  let extra = p.mass.toFixed(2) + ' kg';
  if (p.joint) extra += ` · θ ${fmtDeg(p.angle)} · ≤${p.joint.T} N·m`;
  tip.innerHTML = `<div class="h">${p.label}</div><div class="m">${extra}</div><div class="g">${p.assembled ? 'click → remove (children first)' : 'click → install (parents auto-fit)'}</div>`;
}

function wireUI() {
  $('bExplode').onclick = () => {
    PARTS.forEach((p, i) => { if (p.assembled) { p.assembled = false; elTween(p, 1, 560, i * 42); } });
    if (!labelsOn) { labelsOn = true; $('bLabels').classList.add('on'); $('labels').style.display = ''; }
    refreshPanel();
  };
  $('bAssemble').onclick = () => {
    ASSEMBLE_ORDER.forEach((name, i) => {
      const p = byName[name];
      if (!p.assembled) { p.assembled = true; elTween(p, 0, 460, i * 55); }
    });
    refreshPanel();
  };
  const toggles = [['bLabels', () => { labelsOn = !labelsOn; $('labels').style.display = labelsOn ? '' : 'none'; }],
    ['bJoints', () => { showAxes = !showAxes; syncAxes(); }],
    ['bColliders', () => { showColliders = !showColliders; syncColliders(); }],
    ['bCoM', () => { showCom = !showCom; comSphere.visible = comLine.visible = showCom; }],
    ['bGround', () => { groundOn = !groundOn; }],
    ['bSpin', () => { spin = !spin; controls.autoRotate = spin; }]];
  toggles.forEach(([id, fn]) => {
    $(id).onclick = () => { fn(); $(id).classList.toggle('on'); };
  });
  Object.entries(CAM_PRESETS).forEach(([name, pos]) => {
    $('c' + name).onclick = () => { introActive = false; flyCam(pos); };
  });
  Object.keys(POSES).forEach((name) => {
    $('p' + name.replace('-', '')).onclick = () => applyPose(name);
  });
  $('bShot').onclick = () => {
    renderer.render(scene, camera);
    const a = document.createElement('a');
    a.href = renderer.domElement.toDataURL('image/png');
    a.download = 'rp1_view.png';
    a.click();
  };
  addEventListener('keydown', (e) => { if (e.key === 'Escape') select(null); });
}

const mgr = new THREE.LoadingManager();
let assetsReady = false;
mgr.onProgress = (u, l, t) => {
  $('bar').style.width = (l / t * 100) + '%';
  $('bart').textContent = `fetching meshes… ${l}/${t}`;
  $('ltxt').textContent = t;
};
mgr.onLoad = () => {
  PARTS.forEach(p => {
    const hits = p.hitMeshes;
    hits.forEach(h => p.group.remove(h));
    const box = new THREE.Box3().setFromObject(p.group);
    hits.forEach(h => p.group.add(h));
    if (!box.isEmpty()) p.centerLocal.copy(box.getCenter(new THREE.Vector3())).sub(p.group.position);
  });
  $('loader').style.display = 'none';
  assetsReady = true;
};
mgr.onError = (url) => { $('err').textContent = 'Failed to load ' + url; };

const hasWebGL = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } })();

if (hasWebGL) {
  loader = new STLLoader(mgr);
  if (initScene()) {
    wireUI();
    clock.t = performance.now();
    tick();
  }
} else {
  $('fallback').style.display = 'flex';
  $('loader').style.display = 'none';
}
