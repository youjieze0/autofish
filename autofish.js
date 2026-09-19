"ui";

importClass(android.content.Intent);
importClass(android.app.Activity);
importClass(android.provider.MediaStore);
importClass(android.graphics.Paint);
importClass(android.graphics.Color);
importClass(android.graphics.RectF);
importClass(java.io.ByteArrayOutputStream);
importClass(android.view.View); 
importClass(android.view.MotionEvent);

var CONFIG = {
    workDir:      "/sdcard/AutoFish",   
    pollMs:       100,      
    landscape:    true      
};

var storage = storages.create("autofish"); 
var serviceAlive = false;
var isListening = false;
var screenCaptureReady = false;             

ui.layout(
    <frame w="*" h="*">
        <vertical id="mainPage" padding="24" bg="#FAFAFA" w="*" h="*">
            <text text="🎣 自动钓鱼" textSize="26sp" textColor="#333333" gravity="center" margin="8" />
            <text text="逻辑：红线消失(秒提) → 延迟10秒 → 抛竿 → 放大" textSize="12sp" textColor="#999999" gravity="center" margin="8" />
            
            <button id="btnPickFish" text="① 选定钓鱼键" w="*" h="50dp" textSize="18sp" textColor="#ffffff" bg="#4A90D9" margin="8" />
            <button id="btnPickMag" text="② 选定放大键" w="*" h="50dp" textSize="18sp" textColor="#ffffff" bg="#7E57C2" margin="8" />
            <button id="btnPickLine" text="③ 框选红线区域" w="*" h="50dp" textSize="18sp" textColor="#ffffff" bg="#F5A623" margin="8" />
            <button id="btnStart" text="④ 开启悬浮窗" w="*" h="60dp" textSize="20sp" textColor="#ffffff" bg="#E53935" margin="8" />
            
            <text id="txtStatus" text="正在检查状态..." textSize="15sp" textColor="#E53935" gravity="center" margin="16" />
        </vertical>

        <vertical id="cropPage" bg="#111111" w="*" h="*">
            <horizontal padding="8" gravity="center_vertical" bg="#111111" h="60dp">
                <button id="btnCancel" text="取消" textColor="#ffffff" bg="#555555" w="72dp" h="44dp" />
                <text id="cropTitle" text="请框选区域" textColor="#ffffff" textSize="18sp" gravity="center" layout_weight="1" w="0" />
                <button id="btnDone" text="完成" textColor="#ffffff" bg="#00C853" w="72dp" h="44dp" />
            </horizontal>
            <canvas id="cv" w="*" layout_weight="1" h="0" />
            <text text="操作说明：拖动方框中心移动 · 拖动四个角缩放" textColor="#888888" gravity="center" h="40dp" w="*" />
        </vertical>
    </frame>
);

ui.run(function(){ ui.cropPage.setVisibility(View.GONE); });

function refreshMainUI() {
    var fx = storage.get("fishX");
    var mx = storage.get("magX");
    var region = storage.get("lineRegion");

    var missing = [];
    if (fx == null) missing.push("① 钓鱼键未选定");
    if (mx == null) missing.push("② 放大键未选定");
    if (region == null) missing.push("③ 红线区域未框选");

    ui.run(function () {
        ui.btnPickFish.setText(fx != null ? "✅ ① 已选定钓鱼键" : "① 选定钓鱼键");
        ui.btnPickFish.setBackgroundColor(Color.parseColor(fx != null ? "#4CAF50" : "#4A90D9"));
        ui.btnPickMag.setText(mx != null ? "✅ ② 已选定放大键" : "② 选定放大键");
        ui.btnPickMag.setBackgroundColor(Color.parseColor(mx != null ? "#4CAF50" : "#7E57C2"));
        ui.btnPickLine.setText(region != null ? "✅ ③ 已框选红线" : "③ 框选红线区域");
        ui.btnPickLine.setBackgroundColor(Color.parseColor(region != null ? "#4CAF50" : "#F5A623"));

        if (missing.length > 0) {
            ui.txtStatus.setText("【尚有未完成步骤】\n" + missing.join("\n"));
            ui.txtStatus.setTextColor(Color.parseColor("#E53935")); 
        } else {
            ui.txtStatus.setText("✅ 所有准备就绪，可以点击开启悬浮窗！");
            ui.txtStatus.setTextColor(Color.parseColor("#4CAF50")); 
        }
    });
}

ui.btnPickFish.click(function () { openSelectKey("fishX", "fishY", "请框选【钓鱼按键】"); });
ui.btnPickMag.click(function () { openSelectKey("magX", "magY", "请框选【放大按键】"); });
ui.btnPickLine.click(function () { openSelectRegion(); });
ui.btnStart.click(function () { threads.start(startSystem); });

function openSelectKey(storeX, storeY, title) {
    toast("请从相册选择截图，随后完成框选");
    pickImage(function (imgPath) {
        if (!imgPath) { toast("未获取到图片"); return; }
        var srcImg = images.read(imgPath);
        if (srcImg == null) { toast("图片读取失败"); return; }
        
        launchCropPage(srcImg, title, function (rect) {
            var cx = Math.round(rect.x + rect.w / 2);
            var cy = Math.round(rect.y + rect.h / 2);
            storage.put(storeX, cx);
            storage.put(storeY, cy);
            toast("✅ 坐标已保存");
            refreshMainUI();
        });
    });
}

function openSelectRegion() {
    toast("请选择处于【已放大状态且红线清晰可见】的截图，框选红线");
    pickImage(function (imgPath) {
        if (!imgPath) return;
        var srcImg = images.read(imgPath);
        if (srcImg == null) return;
        
        launchCropPage(srcImg, "请紧贴框选下沉的【红线区域】", function (rect) {
            var region = [Math.round(rect.x), Math.round(rect.y), Math.round(rect.w), Math.round(rect.h)];
            storage.put("lineRegion", JSON.stringify(region));    
            toast("✅ 红线区域已保存");
            refreshMainUI(); 
        });
    });
}

var cropState = { srcImg: null, rect: { x:0, y:0, w:0, h:0 }, drag: null, onDone: null, handleSize: 30 };

function launchCropPage(img, title, onDone) {
    ui.run(function () {
        cropState.srcImg = img;
        cropState.rect = { x: img.getWidth() * 0.3, y: img.getHeight() * 0.3, w: img.getWidth() * 0.4, h: img.getHeight() * 0.4 };
        cropState.onDone = onDone;
        ui.cropTitle.setText(title);
        
        ui.mainPage.setVisibility(View.GONE); 
        ui.cropPage.setVisibility(View.VISIBLE); 
        ui.cv.invalidate();
    });
}

function closeCropPage() {
    ui.run(function () {
        if (cropState.srcImg) cropState.srcImg.recycle();
        cropState.srcImg = null;
        ui.cropPage.setVisibility(View.GONE); 
        ui.mainPage.setVisibility(View.VISIBLE); 
    });
}

ui.btnCancel.click(function () { closeCropPage(); });
ui.btnDone.click(function () {
    var resultRect = { x: cropState.rect.x, y: cropState.rect.y, w: cropState.rect.w, h: cropState.rect.h };
    var callback = cropState.onDone;
    closeCropPage();
    if (callback) callback(resultRect);
});

ui.cv.on("draw", function (canvas) {
    try {
        if (!cropState.srcImg) return;
        var bmp = cropState.srcImg.getBitmap();
        if (!bmp) return;

        var vw = canvas.getWidth();
        var vh = canvas.getHeight();
        if (vw <= 0 || vh <= 0) return;

        var iw = bmp.getWidth(), ih = bmp.getHeight();
        var scale = Math.min(vw / iw, vh / ih);
        var ox = (vw - iw * scale) / 2;
        var oy = (vh - ih * scale) / 2;

        canvas.drawColor(Color.parseColor("#000000"));
        
        var p = new Paint(); p.setFilterBitmap(true);
        var dstRect = new RectF(ox, oy, ox + iw * scale, oy + ih * scale);
        canvas.drawBitmap(bmp, null, dstRect, p);

        var aX = ox + cropState.rect.x * scale;
        var aY = oy + cropState.rect.y * scale;
        var bX = ox + (cropState.rect.x + cropState.rect.w) * scale;
        var bY = oy + (cropState.rect.y + cropState.rect.h) * scale;
        
        var dim = new Paint(); dim.setColor(Color.parseColor("#AA000000"));
        canvas.drawRect(new RectF(0, 0, vw, aY), dim); 
        canvas.drawRect(new RectF(0, bY, vw, vh), dim);
        canvas.drawRect(new RectF(0, aY, aX, bY), dim); 
        canvas.drawRect(new RectF(bX, aY, vw, bY), dim);

        var border = new Paint(); border.setStyle(Paint.Style.STROKE); border.setStrokeWidth(4); border.setColor(Color.parseColor("#FF00E676"));
        canvas.drawRect(new RectF(aX, aY, bX, bY), border);
        
        var fill = new Paint(); fill.setColor(Color.parseColor("#FF00E676")); var hs = cropState.handleSize / 2;
        canvas.drawRect(new RectF(aX - hs, aY - hs, aX + hs, aY + hs), fill); 
        canvas.drawRect(new RectF(bX - hs, aY - hs, bX + hs, aY + hs), fill);
        canvas.drawRect(new RectF(aX - hs, bY - hs, aX + hs, bY + hs), fill); 
        canvas.drawRect(new RectF(bX - hs, bY - hs, bX + hs, bY + hs), fill);

    } catch (e) {}
});

function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }
function near(x, y, cx, cy, tol) { return Math.abs(x - cx) <= tol && Math.abs(y - cy) <= tol; }

ui.cv.setOnTouchListener(function(view, event) {
    try {
        if (!cropState.srcImg) return true;
        var vw = view.getWidth(), vh = view.getHeight();
        if (vw <= 0 || vh <= 0) return true;
        
        var iw = cropState.srcImg.getWidth(), ih = cropState.srcImg.getHeight();
        var scale = Math.min(vw / iw, vh / ih);
        var ox = (vw - iw * scale) / 2, oy = (vh - ih * scale) / 2;
        
        var x = event.getX(), y = event.getY(), action = event.getAction();
        var px = (x - ox) / scale, py = (y - oy) / scale; 
        
        var r = cropState.rect, tol = cropState.handleSize / scale, snap = { x: r.x, y: r.y, w: r.w, h: r.h };
        var minW = 20, minH = 20;

        if (action == MotionEvent.ACTION_DOWN) {
            if (near(px, py, r.x, r.y, tol)) cropState.drag = { mode: "tl", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x + r.w, r.y, tol)) cropState.drag = { mode: "tr", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x, r.y + r.h, tol)) cropState.drag = { mode: "bl", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x + r.w, r.y + r.h, tol)) cropState.drag = { mode: "br", sx: px, sy: py, r: snap };
            else if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) cropState.drag = { mode: "move", sx: px, sy: py, r: snap };
            else cropState.drag = null;
        } else if (action == MotionEvent.ACTION_MOVE && cropState.drag) {
            var dx = px - cropState.drag.sx, dy = py - cropState.drag.sy, d = cropState.drag;
            if (d.mode === "move") { r.x = clamp(d.r.x + dx, 0, iw - r.w); r.y = clamp(d.r.y + dy, 0, ih - r.h); } 
            else if (d.mode === "tl") { var nL = clamp(px, 0, d.r.x + d.r.w - minW), nT = clamp(py, 0, d.r.y + d.r.h - minH); r.x = nL; r.y = nT; r.w = d.r.x + d.r.w - nL; r.h = d.r.y + d.r.h - nT; } 
            else if (d.mode === "tr") { var nR = clamp(px, d.r.x + minW, iw), nT2 = clamp(py, 0, d.r.y + d.r.h - minH); r.y = nT2; r.w = nR - d.r.x; r.h = d.r.y + d.r.h - nT2; } 
            else if (d.mode === "bl") { var nL2 = clamp(px, 0, d.r.x + d.r.w - minW), nB = clamp(py, d.r.y + minH, ih); r.x = nL2; r.w = d.r.x + d.r.w - nL2; r.h = nB - d.r.y; } 
            else if (d.mode === "br") { var nR2 = clamp(px, d.r.x + minW, iw), nB2 = clamp(py, d.r.y + minH, ih); r.w = nR2 - d.r.x; r.h = nB2 - d.r.y; }
            ui.cv.invalidate(); 
        } else if (action == MotionEvent.ACTION_UP) {
            cropState.drag = null;
        }
    } catch (e) {}
    return true;
});

function checkPermissions() {
    if (!floaty.checkPermission()) {
        if (dialogs.confirm("提示", "需要悬浮窗权限，是否前往开启？", "去开启", "取消")) 
            app.startActivity({ action: "android.settings.action.MANAGE_OVERLAY_PERMISSION", data: "package:" + context.getPackageName() });
    }
    if (auto.service == null) {
        if (dialogs.confirm("提示", "需要无障碍服务权限，请在列表中开启。", "去开启", "取消")) 
            app.startActivity({ action: "android.settings.ACCESSIBILITY_SETTINGS" });
    }
    threads.start(function () { ensureScreenCapture(); });
}

function ensureScreenCapture() {
    if (screenCaptureReady) return true;
    var ok = requestScreenCapture(CONFIG.landscape); 
    if (ok) screenCaptureReady = true;
    return ok;
}

function pickImage(callback) {
    var reqCode = 1000 + Math.floor(Math.random() * 1000); 
    var handled = false; 
    var listener = function (requestCode, resultCode, data) {
        if (requestCode === reqCode && !handled) {
            handled = true; 
            if (resultCode !== Activity.RESULT_OK || data == null) {
                callback(null); return;
            }
            threads.start(function () {
                var path = uriToLocalPath(data.getData());
                ui.run(function () { callback(path); }); 
            });
        }
    };
    ui.emitter.on("activity_result", listener); 
    ui.run(function () {
        var intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        activity.startActivityForResult(intent, reqCode);
    });
}

function uriToLocalPath(uri) {
    var path = null;
    try {
        var cursor = context.getContentResolver().query(uri, ["_data"], null, null, null);
        if (cursor != null) {
            if (cursor.moveToFirst()) { var idx = cursor.getColumnIndex("_data"); if (idx >= 0) path = cursor.getString(idx); }
            cursor.close();
        }
    } catch (e) { }
    if (path == null || !files.exists(path)) {
        try {
            files.ensureDir(CONFIG.workDir);
            path = files.join(CONFIG.workDir, "tmp_" + Date.now() + ".png");
            var is = context.getContentResolver().openInputStream(uri);
            files.writeBytes(path, inputStreamToBytes(is));
        } catch (e) { return null; }
    }
    return path;
}

function inputStreamToBytes(is) {
    var baos = new ByteArrayOutputStream(); var buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096); var n;
    while ((n = is.read(buf)) !== -1) { baos.write(buf, 0, n); }
    is.close(); return baos.toByteArray();
}

function doClick(x, y) { try { click(x, y); } catch (e) { gesture(80, [x, y]); } }

function countRedPixels(img, region) {
    try {
        var bitmap = img.getBitmap();
        var bw = bitmap.getWidth();
        var bh = bitmap.getHeight();
        
        var rx = Math.max(0, region[0]);
        var ry = Math.max(0, region[1]);
        var rw = Math.min(region[2], bw - rx);
        var rh = Math.min(region[3], bh - ry);
        if (rw <= 0 || rh <= 0) return 0;

        var pixels = java.lang.reflect.Array.newInstance(java.lang.Integer.TYPE, rw * rh);
        bitmap.getPixels(pixels, 0, rw, rx, ry, rw, rh);
        
        var count = 0;
        for (var i = 0; i < pixels.length; i++) {
            var c = pixels[i];
            var r = (c >> 16) & 0xff;
            var g = (c >> 8) & 0xff;
            var b = c & 0xff;
            
            if (r > 80 && r > g * 1.2 && r > b * 1.2) {
                count++;
            }
        }
        return count;
    } catch(e) {
        return 0;
    }
}

function startSystem() {
    var fx = storage.get("fishX"), fy = storage.get("fishY");
    var mx = storage.get("magX"), my = storage.get("magY");
    var rawReg = storage.get("lineRegion");
    
    if (fx == null || mx == null || rawReg == null) { toast("请先完成前面的框选配置"); return; }
    if (!ensureScreenCapture()) { toast("屏幕截取权限获取失败"); return; }

    var region = JSON.parse(rawReg);

    ui.run(function () {
        home();
        serviceAlive = true;
        isListening = false; 
        launchFloatAndLoop(fx, fy, mx, my, region);
    });
}

function launchFloatAndLoop(fx, fy, mx, my, region) {
    var floatWin = floaty.window(
        <vertical bg="#50000000" padding="4" w="88dp">
            <button id="toggleStatus" text="▶ 开启检测" textSize="14sp" textColor="#ffffff" bg="#4CAF50" h="40dp" />
            <button id="stop" text="⏹ 彻底退出" textSize="12sp" textColor="#ffffff" bg="#E53935" h="32dp" />
        </vertical>
    );
    floatWin.setPosition(30, 400);   
    
    var state = "WAIT_BITE"; 

    floatWin.toggleStatus.click(function () {
        if(isListening) {
            isListening = false;
            ui.run(function(){
                floatWin.toggleStatus.setText("▶ 开启检测");
                floatWin.toggleStatus.setBackgroundColor(Color.parseColor("#4CAF50"));
            });
            toast("检测已暂停");
        } else {
            isListening = true;
            state = "WAIT_BITE"; 
            ui.run(function(){
                floatWin.toggleStatus.setText("👀 守望红线...");
                floatWin.toggleStatus.setBackgroundColor(Color.parseColor("#F5A623"));
            });
            toast("请确保画面中已有红线，开始检测下沉...");
        }
    });

    floatWin.stop.click(function () {
        serviceAlive = false;
        isListening = false;             
        floatWin.close();
        toast("脚本已退出");
    });

    threads.start(function () {
        var confirmCount = 0;               

        while (serviceAlive) {
            try {
                if (!isListening) { sleep(100); continue; }
                
                var screen = captureScreen(); 
                if (screen == null) { sleep(CONFIG.pollMs); continue; }
                
                var redCount = countRedPixels(screen, region);
                screen.recycle();

                if (state === "WAIT_BITE") {
                    if (redCount < 3) { 
                        confirmCount++;
                        if (confirmCount >= 2) {
                            isListening = false; 
                            ui.run(function(){
                                floatWin.toggleStatus.setText("⚙️ 自动化流...");
                                floatWin.toggleStatus.setBackgroundColor(Color.parseColor("#E53935"));
                            });

                            doClick(fx, fy);  
                            
                            sleep(10000);
                            
                            doClick(fx, fy);  
                            
                            sleep(1000);
                            doClick(mx, my);  
                            
                            state = "WAIT_LINE";
                            confirmCount = 0;
                            isListening = true;
                            
                            ui.run(function(){
                                floatWin.toggleStatus.setText("🔎 等红线刷新");
                                floatWin.toggleStatus.setBackgroundColor(Color.parseColor("#7E57C2"));
                            });
                        }
                    } else { 
                        confirmCount = 0; 
                    }
                } 
                else if (state === "WAIT_LINE") {
                    if (redCount >= 5) {
                        confirmCount++;
                        if (confirmCount >= 2) {
                            state = "WAIT_BITE";
                            confirmCount = 0;
                            
                            ui.run(function(){
                                floatWin.toggleStatus.setText("👀 守望红线...");
                                floatWin.toggleStatus.setBackgroundColor(Color.parseColor("#F5A623"));
                            });
                        }
                    } else {
                        confirmCount = 0;
                    }
                }
            } catch (e) {}
            sleep(CONFIG.pollMs);
        }
    });
}

events.on("exit", function () { serviceAlive = false; isListening = false; });

refreshMainUI(); 
setTimeout(checkPermissions, 300);