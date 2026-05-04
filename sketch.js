let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機擷取
  capture = createCapture(VIDEO);
  
  // 設定擷取影像的預設大小（可隨視窗縮放調整）
  capture.size(640, 480); // 設定擷取解析度，實際顯示大小由 draw() 控制
  
  // 隱藏預設在畫布下方的 HTML 影片元件，只在畫布內繪製
  capture.hide();
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
  pop();
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
