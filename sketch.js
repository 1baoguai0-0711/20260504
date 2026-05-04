let capture;
let faceMesh;
let faces = [];
// 指定要串接的臉部特徵點編號
let faceIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 新增的內圈臉部特徵點編號
let innerLipIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

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
  
  // 繪製影像，注意因為 scale 翻轉了座標系，此處座標設為 (0, 0)
  image(capture, 0, 0, imgW, imgH);

  // 繪製指定的臉部辨識連線
  if (faces.length > 0) {
    let face = faces[0];
    stroke(255, 0, 0); // 設定線條顏色為紅色
    strokeWeight(15);  // 設定線條粗細為 15
    strokeCap(ROUND);  // 使線條末端圓滑
    strokeJoin(ROUND); // 使線條轉折處圓滑
    noFill();

    // 計算縮放比例，以將偵測到的座標對應到顯示的大小 (50% 螢幕寬高)
    let sx = imgW / capture.width;
    let sy = imgH / capture.height;

    // 依序串接點位，並首尾相連形成封閉的口紅輪廓
    for (let i = 0; i < faceIndices.length; i++) {
      let p1 = face.keypoints[faceIndices[i]];
      let p2 = face.keypoints[faceIndices[(i + 1) % faceIndices.length]];
      
      if (p1 && p2) {
        line(p1.x * sx, p1.y * sy, p2.x * sx, p2.y * sy);
      }
    }

    // 繪製第二組指定的連線（內圈），粗細為 1
    strokeWeight(1);
    for (let i = 0; i < innerLipIndices.length; i++) {
      let p1 = face.keypoints[innerLipIndices[i]];
      let p2 = face.keypoints[innerLipIndices[(i + 1) % innerLipIndices.length]];
      
      if (p1 && p2) {
        line(p1.x * sx, p1.y * sy, p2.x * sx, p2.y * sy);
      }
    }
  }
  pop();
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotFaces(results) {
  faces = results;
}
