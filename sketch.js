let capture;
let faceMesh;
let faces = [];
// 指定要串接的臉部特徵點編號
let faceIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 新增另一組要串接的臉部特徵點編號
let innerLipIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
// 右眼外圈特徵點 (包含與 247 對稱的 467)
let rightEyeOuterIndices = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255];
// 右眼內圈特徵點 (包含與 246 對稱 of 466)
let rightEyeInnerIndices = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
// 左眼外圈特徵點 (包含編號 247)
let leftEyeOuterIndices = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
// 左眼內圈特徵點 (包含編號 246)
let leftEyeInnerIndices = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
// 臉部最外層輪廓特徵點 (Face Oval)
let faceOvalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function preload() {
  // 載入 ml5.js 的 FaceMesh 模型
  faceMesh = ml5.faceMesh();
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機擷取
  capture = createCapture(VIDEO);
  
  // 設定擷取影像的預設大小（可隨視窗縮放調整）
  capture.size(640, 480); // 設定擷取解析度，實際顯示大小由 draw() 控制
  
  // 隱藏預設在畫布下方的 HTML 影片元件，只在畫布內繪製
  capture.hide();

  // 開始對攝影機進行臉部偵測
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');
  
  // 定義影像要顯示的寬高（螢幕的 50%）
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  
  // 計算置中座標
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  push();
  // 實作鏡像翻轉（左右顛倒）
  // 1. 移動座標原點到影像水平位置加上寬度的位置
  // 2. 利用 scale(-1, 1) 進行水平翻轉
  translate(x + imgW, y);
  scale(-1, 1);
  
  if (faces.length > 0) {
    let face = faces[0];
    
    // 動態計算縮放比例，確保線條座標隨影像大小與解析度即時調整
    let sx = capture.width > 0 ? imgW / capture.width : 1;
    let sy = capture.height > 0 ? imgH / capture.height : 1;

    // 1. 繪製攝影機影像
    image(capture, 0, 0, imgW, imgH);

    // 2. 繪製黑色遮罩，挖出臉部區域
    fill(0); // 黑色填充
    noStroke();
    beginShape();
    // 外部矩形（涵蓋整個擷取視窗）
    vertex(0, 0);
    vertex(imgW, 0);
    vertex(imgW, imgH);
    vertex(0, imgH);
    // 內部孔洞（臉部外層輪廓）
    beginContour();
    for (let i = 0; i < faceOvalIndices.length; i++) {
      let p = face.keypoints[faceOvalIndices[i]];
      vertex(p.x * sx, p.y * sy);
    }
    endContour();
    endShape(CLOSE);

    // 3. 繪製紅色特徵連線 (線條將跟隨臉部 keypoints 移動)
    stroke(255, 0, 0);
    strokeWeight(1);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    noFill();

    // 依序呼叫繪製函式，確保嘴部、雙眼及臉廓線條精準跟隨
    drawConnectors(face.keypoints, faceIndices, sx, sy);
    drawConnectors(face.keypoints, innerLipIndices, sx, sy);
    drawConnectors(face.keypoints, rightEyeOuterIndices, sx, sy);
    drawConnectors(face.keypoints, rightEyeInnerIndices, sx, sy);
    drawConnectors(face.keypoints, leftEyeOuterIndices, sx, sy);
    drawConnectors(face.keypoints, leftEyeInnerIndices, sx, sy);
    drawConnectors(face.keypoints, faceOvalIndices, sx, sy);
  } else {
    // 如果沒偵測到臉部，顯示黑色區塊
    fill(0);
    rect(0, 0, imgW, imgH);
  }
  pop();
}

/**
 * 輔助函式：根據索引陣列串接特徵點並繪製閉合線條
 */
function drawConnectors(keypoints, indices, sx, sy) {
  for (let i = 0; i < indices.length; i++) {
    let p1 = keypoints[indices[i]];
    let p2 = keypoints[indices[(i + 1) % indices.length]];
    if (p1 && p2) {
      line(p1.x * sx, p1.y * sy, p2.x * sx, p2.y * sy);
    }
  }
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotFaces(results) {
  faces = results;
}
