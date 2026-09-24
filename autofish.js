"ui";

importClass(android.content.Intent);
importClass(android.content.Context);
importClass(android.app.Activity);
importClass(android.provider.MediaStore);
importClass(android.graphics.Paint);
importClass(android.graphics.Color);
importClass(android.graphics.RectF);
importClass(java.io.ByteArrayOutputStream);
importClass(android.view.View); 
importClass(android.view.MotionEvent);
importClass(android.app.ActivityManager);
importClass(android.view.animation.DecelerateInterpolator);
importClass(android.graphics.drawable.GradientDrawable);

ui.statusBarColor("#FEF7FF");

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
    <frame bg="#FEF7FF" w="*" h="*">
        
        <viewpager id="viewPager" w="*" h="*">
            <vertical id="mainPage" padding="24" w="*" h="*">
                <text text="自动钓鱼" textSize="30sp" textColor="#1D192B" textStyle="bold" gravity="center" marginTop="16" />
                <text text="红线秒提 · 10秒延迟 · 智能防封" textSize="14sp" textColor="#49454F" gravity="center" marginTop="8" marginBottom="32" />
                
                <card id="cardFish" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" cardBackgroundColor="#E8DEF8" foreground="?selectableItemBackground">
                    <text id="btnPickFish" text="① 选定钓鱼键" textSize="18sp" textColor="#1D192B" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
                
                <card id="cardMag" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" cardBackgroundColor="#E8DEF8" foreground="?selectableItemBackground">
                    <text id="btnPickMag" text="② 选定放大键" textSize="18sp" textColor="#1D192B" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
                
                <card id="cardLine" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" cardBackgroundColor="#E8DEF8" foreground="?selectableItemBackground">
                    <text id="btnPickLine" text="③ 框选红线区域" textSize="18sp" textColor="#1D192B" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
                
                <card id="cardStart" w="*" h="72dp" margin="8 32 8 8" cardCornerRadius="24dp" cardElevation="2dp" cardBackgroundColor="#B3261E" foreground="?selectableItemBackground">
                    <text id="btnStart" text="④ 开启悬浮窗" textSize="22sp" textColor="#FFFFFF" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
                
                <text id="txtStatus" text="正在检查状态..." textSize="14sp" textColor="#B3261E" textStyle="bold" gravity="center" margin="16" />
            </vertical>
            
            <frame id="pageSettings" w="*" h="*">
                <vertical padding="24" w="*" h="*">
                    <text text="设置" textSize="30sp" textColor="#1D192B" textStyle="bold" marginTop="16" marginBottom="24" />
                    
                    <card w="*" h="wrap_content" margin="8" cardCornerRadius="16dp" cardElevation="0dp" cardBackgroundColor="#F3EDF7">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text text="隐藏后台任务" textSize="18sp" textColor="#1D192B" textStyle="bold" />
                                <text text="开启后在最近任务列表中不显示本应用" textSize="12sp" textColor="#49454F" marginTop="0" />
                            </vertical>
                            <Switch id="switchHideTask" checked="false" />
                        </horizontal>
                    </card>
                </vertical>
            </frame>
        </viewpager>

        <card id="bottomNav" w="wrap_content" h="64dp" cardElevation="6dp" cardBackgroundColor="#F3EDF7" cardCornerRadius="32dp" layout_gravity="bottom|center_horizontal" marginBottom="24">
            <frame w="wrap_content" h="wrap_content" layout_gravity="center" padding="8 0">
                <frame id="navIndicator" w="100dp" h="48dp" layout_gravity="center_vertical|left" />
                
                <horizontal w="wrap_content" h="wrap_content" gravity="center">
                    <frame id="tabHomeWrap" w="100dp" h="48dp">
                        <text id="txtTabHome" text="主页" textSize="16sp" textColor="#1D192B" textStyle="bold" gravity="center" w="*" h="*" />
                    </frame>
                    <frame id="tabSettingsWrap" w="100dp" h="48dp" marginLeft="4">
                        <text id="txtTabSettings" text="设置" textSize="16sp" textColor="#49454F" textStyle="normal" gravity="center" w="*" h="*" />
                    </frame>
                </horizontal>
            </frame>
        </card>

        <vertical id="cropPage" bg="#111111" w="*" h="*">
            <horizontal padding="8" gravity="center_vertical" bg="#1F1F1F" h="64dp">
                <card id="btnCancel" w="72dp" h="44dp" cardCornerRadius="12dp" cardBackgroundColor="#49454F" foreground="?selectableItemBackground" margin="8 0">
                    <text text="取消" textColor="#E6E0E9" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
                <text id="cropTitle" text="请框选区域" textColor="#E6E0E9" textSize="18sp" textStyle="bold" gravity="center" layout_weight="1" w="0" />
                <card id="btnDone" w="72dp" h="44dp" cardCornerRadius="12dp" cardBackgroundColor="#6750A4" foreground="?selectableItemBackground" margin="8 0">
                    <text text="完成" textColor="#FFFFFF" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
            </horizontal>
            <canvas id="cv" w="*" layout_weight="1" h="0" />
            <text text="拖动中心移动 · 拖动四角缩放" textColor="#CAC4D0" textSize="14sp" gravity="center" h="48dp" w="*" />
        </vertical>

    </frame>
);

var density = context.getResources().getDisplayMetrics().density;
var moveDistPx = 104 * density;

ui.run(function(){ 
    var indicatorBg = new GradientDrawable();
    indicatorBg.setShape(GradientDrawable.RECTANGLE);
    indicatorBg.setCornerRadius(24 * density);
    indicatorBg.setColor(Color.parseColor("#E8DEF8"));
    ui.navIndicator.setBackground(indicatorBg);

    try { if (activity.getActionBar()) activity.getActionBar().hide(); } catch(e) {}
    try { if (activity.getSupportActionBar && activity.getSupportActionBar()) activity.getSupportActionBar().hide(); } catch(e) {}
    try { activity.getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR); } catch(e) {}
    
    try {
        var tbId = context.getResources().getIdentifier("toolbar", "id", context.getPackageName());
        if (tbId != 0) {
            var tb = activity.findViewById(tbId);
            if (tb) tb.setVisibility(View.GONE);
        }
        var abId = context.getResources().getIdentifier("appbar", "id", context.getPackageName());
        if (abId != 0) {
            var ab = activity.findViewById(abId);
            if (ab) ab.setVisibility(View.GONE);
        }
        var actionId = context.getResources().getIdentifier("action_bar", "id", context.getPackageName());
        if (actionId != 0) {
            var ac = activity.findViewById(actionId);
            if (ac) ac.setVisibility(View.GONE);
        }
    } catch(e) {}

    ui.cropPage.setVisibility(View.GONE); 
    
    var hideSaved = storage.get("hideTask", false);
    ui.switchHideTask.setChecked(hideSaved);
    
    try {
        var am = context.getSystemService(Context.ACTIVITY_SERVICE);
        var tasks = am.getAppTasks();
        if (tasks != null && tasks.size() > 0) {
            tasks.get(0).setExcludeFromRecents(hideSaved);
        }
    } catch(e) {}
});

ui.switchHideTask.setOnCheckedChangeListener(function(view, isChecked) {
    storage.put("hideTask", isChecked);
    try {
        var am = context.getSystemService(Context.ACTIVITY_SERVICE);
        var tasks = am.getAppTasks();
        if (tasks != null && tasks.size() > 0) {
            tasks.get(0).setExcludeFromRecents(isChecked);
        }
    } catch(e) {}
});

ui.tabHomeWrap.click(function() {
    ui.viewPager.setCurrentItem(0, true);
});

ui.tabSettingsWrap.click(function() {
    ui.viewPager.setCurrentItem(1, true);
});

ui.viewPager.setOnPageChangeListener({
    onPageSelected: function(index) {
        var targetX = (index == 0) ? 0 : moveDistPx;
        ui.run(function() {
            ui.navIndicator.animate()
                .translationX(targetX)
                .setDuration(300)
                .setInterpolator(new DecelerateInterpolator(1.5))
                .start();

            if (index == 0) {
                ui.txtTabHome.setTextColor(Color.parseColor("#1D192B"));
                ui.txtTabHome.setTypeface(null, android.graphics.Typeface.BOLD);
                ui.txtTabSettings.setTextColor(Color.parseColor("#49454F"));
                ui.txtTabSettings.setTypeface(null, android.graphics.Typeface.NORMAL);
            } else {
                ui.txtTabHome.setTextColor(Color.parseColor("#49454F"));
                ui.txtTabHome.setTypeface(null, android.graphics.Typeface.NORMAL);
                ui.txtTabSettings.setTextColor(Color.parseColor("#1D192B"));
                ui.txtTabSettings.setTypeface(null, android.graphics.Typeface.BOLD);
            }
        });
    }
});

function refreshMainUI() {
    var fx = storage.get("fishX"), mx = storage.get("magX"), region = storage.get("lineRegion");
    var missing = [];
    if (fx == null) missing.push("① 钓鱼键未选定");
    if (mx == null) missing.push("② 放大键未选定");
    if (region == null) missing.push("③ 红线区域未选定");

    ui.run(function () {
        ui.cardFish.setCardBackgroundColor(Color.parseColor(fx != null ? "#D0BCFF" : "#E8DEF8"));
        ui.btnPickFish.setText(fx != null ? "① 已选定钓鱼键" : "① 选定钓鱼键");
        ui.btnPickFish.setTextColor(Color.parseColor(fx != null ? "#381E72" : "#1D192B"));

        ui.cardMag.setCardBackgroundColor(Color.parseColor(mx != null ? "#D0BCFF" : "#E8DEF8"));
        ui.btnPickMag.setText(mx != null ? "② 已选定放大键" : "② 选定放大键");
        ui.btnPickMag.setTextColor(Color.parseColor(mx != null ? "#381E72" : "#1D192B"));

        ui.cardLine.setCardBackgroundColor(Color.parseColor(region != null ? "#D0BCFF" : "#E8DEF8"));
        ui.btnPickLine.setText(region != null ? "③ 已框选红线" : "③ 框选红线区域");
        ui.btnPickLine.setTextColor(Color.parseColor(region != null ? "#381E72" : "#1D192B"));

        if (missing.length > 0) {
            ui.cardStart.setCardBackgroundColor(Color.parseColor("#B3261E"));
            ui.txtStatus.setText("【尚有未完成步骤】\n" + missing.join(" , "));
            ui.txtStatus.setTextColor(Color.parseColor("#B3261E")); 
        } else {
            ui.cardStart.setCardBackgroundColor(Color.parseColor("#6750A4"));
            ui.txtStatus.setText("所有准备就绪，可以点击开启悬浮窗！");
            ui.txtStatus.setTextColor(Color.parseColor("#6750A4")); 
        }
    });
}

ui.cardFish.click(function () { openSelectKey("fishX", "fishY", "请框选【钓鱼按键】"); });
ui.cardMag.click(function () { openSelectKey("magX", "magY", "请框选【放大按键】"); });
ui.cardLine.click(function () { openSelectRegion(); });
ui.cardStart.click(function () { 
    threads.start(startSystem); 
});

function openSelectKey(storeX, storeY, title) {
    toast("请从相册选择截图，随后完成框选");
    pickImage(function (imgPath) {
        if (!imgPath) return;
        var srcImg = images.read(imgPath);
        if (srcImg == null) return;
        
        launchCropPage(srcImg, title, function (rect) {
            var cx = Math.round(rect.x + rect.w / 2), cy = Math.round(rect.y + rect.h / 2);
            storage.put(storeX, cx); storage.put(storeY, cy);
            toast("坐标已保存"); refreshMainUI();
        });
    });
}

function openSelectRegion() {
    toast("请选择已放大的红线截图，紧贴框选红线");
    pickImage(function (imgPath) {
        if (!imgPath) return;
        var srcImg = images.read(imgPath);
        if (srcImg == null) return;
        
        launchCropPage(srcImg, "紧贴框选下沉【红线】", function (rect) {
            var region = [Math.round(rect.x), Math.round(rect.y), Math.round(rect.w), Math.round(rect.h)];
            storage.put("lineRegion", JSON.stringify(region));    
            toast("红线区域已保存"); refreshMainUI(); 
        });
    });
}

var cropState = { srcImg: null, rect: { x:0, y:0, w:0, h:0 }, drag: null, onDone: null, handleSize: 30 };

function launchCropPage(img, title, onDone) {
    ui.run(function () {
        cropState.srcImg = img;
        cropState.rect = { x: img.getWidth() * 0.3, y: img.getHeight() * 0.3, w: img.getWidth() * 0.4, h: img.getHeight() * 0.4 };
        cropState.onDone = onDone; ui.cropTitle.setText(title);
        
        ui.viewPager.setVisibility(View.GONE); 
        ui.bottomNav.setVisibility(View.GONE);
        ui.cropPage.setVisibility(View.VISIBLE); 
        ui.cv.invalidate();
    });
}

function closeCropPage() {
    ui.run(function () {
        if (cropState.srcImg) cropState.srcImg.recycle();
        cropState.srcImg = null;
        
        ui.cropPage.setVisibility(View.GONE); 
        ui.viewPager.setVisibility(View.VISIBLE); 
        ui.bottomNav.setVisibility(View.VISIBLE);
    });
}

ui.btnCancel.click(function () { closeCropPage(); });
ui.btnDone.click(function () {
    var resultRect = { x: cropState.rect.x, y: cropState.rect.y, w: cropState.rect.w, h: cropState.rect.h };
    var callback = cropState.onDone; closeCropPage(); if (callback) callback(resultRect);
});

ui.cv.on("draw", function (canvas) {
    try {
        if (!cropState.srcImg) return;
        var bmp = cropState.srcImg.getBitmap(); if (!bmp) return;
        var vw = canvas.getWidth(), vh = canvas.getHeight(); if (vw <= 0 || vh <= 0) return;
        var iw = bmp.getWidth(), ih = bmp.getHeight();
        var scale = Math.min(vw / iw, vh / ih);
        var ox = (vw - iw * scale) / 2, oy = (vh - ih * scale) / 2;

        canvas.drawColor(Color.parseColor("#1F1F1F"));
        var p = new Paint(); p.setFilterBitmap(true);
        canvas.drawBitmap(bmp, null, new RectF(ox, oy, ox + iw * scale, oy + ih * scale), p);

        var aX = ox + cropState.rect.x * scale, aY = oy + cropState.rect.y * scale;
        var bX = ox + (cropState.rect.x + cropState.rect.w) * scale, bY = oy + (cropState.rect.y + cropState.rect.h) * scale;
        
        var dim = new Paint(); dim.setColor(Color.parseColor("#C8000000"));
        canvas.drawRect(new RectF(0, 0, vw, aY), dim); canvas.drawRect(new RectF(0, bY, vw, vh), dim);
        canvas.drawRect(new RectF(0, aY, aX, bY), dim); canvas.drawRect(new RectF(bX, aY, vw, bY), dim);

        var border = new Paint(); border.setStyle(Paint.Style.STROKE); border.setStrokeWidth(6); border.setColor(Color.parseColor("#D0BCFF"));
        canvas.drawRect(new RectF(aX, aY, bX, bY), border);
        
        var fill = new Paint(); fill.setColor(Color.parseColor("#D0BCFF")); var hs = cropState.handleSize / 2;
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
        var vw = view.getWidth(), vh = view.getHeight(); if (vw <= 0 || vh <= 0) return true;
        var iw = cropState.srcImg.getWidth(), ih = cropState.srcImg.getHeight();
        var scale = Math.min(vw / iw, vh / ih);
        var ox = (vw - iw * scale) / 2, oy = (vh - ih * scale) / 2;
        var px = (event.getX() - ox) / scale, py = (event.getY() - oy) / scale, action = event.getAction(); 
        var r = cropState.rect, tol = cropState.handleSize / scale, snap = { x: r.x, y: r.y, w: r.w, h: r.h };

        if (action == MotionEvent.ACTION_DOWN) {
            if (near(px, py, r.x, r.y, tol)) cropState.drag = { mode: "tl", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x + r.w, r.y, tol)) cropState.drag = { mode: "tr", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x, r.y + r.h, tol)) cropState.drag = { mode: "bl", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x + r.w, r.y + r.h, tol)) cropState.drag = { mode: "br", sx: px, sy: py, r: snap };
            else if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) cropState.drag = { mode: "move", sx: px, sy: py, r: snap };
            else cropState.drag = null;
        } else if (action == MotionEvent.ACTION_MOVE && cropState.drag) {
            var dx = px - cropState.drag.sx, dy = py - cropState.drag.sy, d = cropState.drag, minW = 20, minH = 20;
            if (d.mode === "move") { r.x = clamp(d.r.x + dx, 0, iw - r.w); r.y = clamp(d.r.y + dy, 0, ih - r.h); } 
            else if (d.mode === "tl") { var nL = clamp(px, 0, d.r.x + d.r.w - minW), nT = clamp(py, 0, d.r.y + d.r.h - minH); r.x = nL; r.y = nT; r.w = d.r.x + d.r.w - nL; r.h = d.r.y + d.r.h - nT; } 
            else if (d.mode === "tr") { var nR = clamp(px, d.r.x + minW, iw), nT2 = clamp(py, 0, d.r.y + d.r.h - minH); r.y = nT2; r.w = nR - d.r.x; r.h = d.r.y + d.r.h - nT2; } 
            else if (d.mode === "bl") { var nL2 = clamp(px, 0, d.r.x + d.r.w - minW), nB = clamp(py, d.r.y + minH, ih); r.x = nL2; r.w = d.r.x + d.r.w - nL2; r.h = nB - d.r.y; } 
            else if (d.mode === "br") { var nR2 = clamp(px, d.r.x + minW, iw), nB2 = clamp(py, d.r.y + minH, ih); r.w = nR2 - d.r.x; r.h = nB2 - d.r.y; }
            ui.cv.invalidate(); 
        } else if (action == MotionEvent.ACTION_UP) cropState.drag = null;
    } catch (e) {} return true;
});

function checkPermissions() {
    threads.start(function () {
        if (!floaty.checkPermission()) {
            if (confirm("权限提示", "需要悬浮窗权限，是否前往开启？")) {
                try { app.startActivity({ action: "android.settings.action.MANAGE_OVERLAY_PERMISSION", data: "package:" + context.getPackageName() }); } catch (e) {}
            }
        }
        if (auto.service == null) {
            if (confirm("权限提示", "需要无障碍服务权限，请在列表中开启。")) {
                try { app.startActivity({ action: "android.settings.ACCESSIBILITY_SETTINGS" }); } catch (e) {}
            }
        }
        ensureScreenCapture();
    });
}

function ensureScreenCapture() {
    if (screenCaptureReady) return true;
    var ok = requestScreenCapture(CONFIG.landscape); 
    if (ok) screenCaptureReady = true; return ok;
}

function pickImage(callback) {
    var reqCode = 1000 + Math.floor(Math.random() * 1000); 
    var handled = false; 
    var listener = function (req, res, data) {
        if (req === reqCode && !handled) {
            handled = true; 
            if (res !== Activity.RESULT_OK || data == null) { callback(null); return; }
            threads.start(function () { var path = uriToLocalPath(data.getData()); ui.run(function () { callback(path); }); });
        }
    };
    ui.emitter.on("activity_result", listener); 
    ui.run(function () { activity.startActivityForResult(new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI), reqCode); });
}

function uriToLocalPath(uri) {
    var path = null;
    try {
        var cursor = context.getContentResolver().query(uri, ["_data"], null, null, null);
        if (cursor != null) { if (cursor.moveToFirst()) { var idx = cursor.getColumnIndex("_data"); if (idx >= 0) path = cursor.getString(idx); } cursor.close(); }
    } catch (e) { }
    if (path == null || !files.exists(path)) {
        try {
            files.ensureDir(CONFIG.workDir); path = files.join(CONFIG.workDir, "tmp_" + Date.now() + ".png");
            var is = context.getContentResolver().openInputStream(uri); files.writeBytes(path, inputStreamToBytes(is));
        } catch (e) { return null; }
    }
    return path;
}
function inputStreamToBytes(is) { var baos = new ByteArrayOutputStream(), buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096), n; while ((n = is.read(buf)) !== -1) { baos.write(buf, 0, n); } is.close(); return baos.toByteArray(); }
function doClick(x, y) { try { click(x, y); } catch (e) { gesture(80, [x, y]); } }

function countRedPixels(img, region) {
    try {
        var bitmap = img.getBitmap(), bw = bitmap.getWidth(), bh = bitmap.getHeight();
        var rx = Math.max(0, region[0]), ry = Math.max(0, region[1]), rw = Math.min(region[2], bw - rx), rh = Math.min(region[3], bh - ry);
        if (rw <= 0 || rh <= 0) return 0;
        var pixels = java.lang.reflect.Array.newInstance(java.lang.Integer.TYPE, rw * rh);
        bitmap.getPixels(pixels, 0, rw, rx, ry, rw, rh);
        var count = 0;
        for (var i = 0; i < pixels.length; i++) {
            var c = pixels[i], r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
            if (r > 80 && r > g * 1.2 && r > b * 1.2) count++;
        }
        return count;
    } catch(e) { return 0; }
}

function startSystem() {
    var fx = storage.get("fishX"), fy = storage.get("fishY"), mx = storage.get("magX"), my = storage.get("magY"), rawReg = storage.get("lineRegion");
    if (fx == null || mx == null || rawReg == null) { toast("请先完成前面的配置"); return; }
    if (!ensureScreenCapture()) { toast("屏幕截取权限获取失败"); return; }

    var region = JSON.parse(rawReg);
    ui.run(function () {
        home();
        serviceAlive = true; isListening = false; 
        launchFloatAndLoop(fx, fy, mx, my, region);
    });
}

function launchFloatAndLoop(fx, fy, mx, my, region) {
    var floatWin = floaty.window(
        <frame id="floatRoot" w="wrap_content" h="wrap_content">
            <card id="floatBg" w="wrap_content" h="wrap_content" cardCornerRadius="20dp" cardElevation="4dp" cardBackgroundColor="#F3EDF7" alpha="1.0">
                <vertical padding="10">
                    <card id="btnToggle" w="96dp" h="44dp" cardCornerRadius="14dp" cardElevation="0dp" cardBackgroundColor="#6750A4" margin="0 0 0 10" foreground="?selectableItemBackground">
                        <text id="txtToggle" text="开启检测" textSize="15sp" textColor="#FFFFFF" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>
                    <card id="btnStop" w="96dp" h="36dp" cardCornerRadius="12dp" cardElevation="0dp" cardBackgroundColor="#B3261E" foreground="?selectableItemBackground">
                        <text text="彻底退出" textSize="13sp" textColor="#FFFFFF" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>
                </vertical>
            </card>
        </frame>
    );

    setTimeout(function() {
        try { floatWin.setPosition(30, 400); } catch(e) {}
    }, 300);
    
    var state = "WAIT_BITE"; 
    
    var alphaTimer = null;
    function wakeUpFloat() {
        ui.run(function(){ floatWin.floatBg.setAlpha(1.0); }); 
        if(alphaTimer) clearTimeout(alphaTimer);
        alphaTimer = setTimeout(function(){
            ui.run(function(){ floatWin.floatBg.setAlpha(0.4); }); 
        }, 3000);
    }
    wakeUpFloat();

    floatWin.floatRoot.setOnTouchListener(function(view, event) {
        wakeUpFloat();
        return false; 
    });

    floatWin.btnToggle.click(function () {
        wakeUpFloat();
        if(isListening) {
            isListening = false;
            ui.run(function(){
                floatWin.txtToggle.setText("开启检测");
                floatWin.btnToggle.setCardBackgroundColor(Color.parseColor("#6750A4")); 
            });
            toast("检测已暂停");
        } else {
            isListening = true;
            state = "WAIT_BITE"; 
            ui.run(function(){
                floatWin.txtToggle.setText("守望红线...");
                floatWin.btnToggle.setCardBackgroundColor(Color.parseColor("#825500")); 
            });
            toast("请确保画面中已有红线，开始检测...");
        }
    });

    floatWin.btnStop.click(function () {
        serviceAlive = false; isListening = false;             
        floatWin.close(); toast("脚本已退出");
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
                                wakeUpFloat(); 
                                floatWin.txtToggle.setText("收杆中...");
                                floatWin.btnToggle.setCardBackgroundColor(Color.parseColor("#BA1A1A")); 
                            });

                            doClick(fx, fy);  
                            sleep(10000);     
                            doClick(fx, fy);  
                            sleep(1000);
                            doClick(mx, my);  
                            
                            sleep(1000);
                            var dm = context.getResources().getDisplayMetrics();
                            var cx = dm.widthPixels / 2;
                            var cy = dm.heightPixels / 2;
                            try { swipe(cx, cy, cx + 200, cy, 300); } catch(e) {}
                            
                            state = "WAIT_LINE";
                            confirmCount = 0;
                            isListening = true;
                            
                            ui.run(function(){
                                wakeUpFloat();
                                floatWin.txtToggle.setText("等待刷新");
                                floatWin.btnToggle.setCardBackgroundColor(Color.parseColor("#4A4458")); 
                            });
                        }
                    } else { confirmCount = 0; }
                } 
                else if (state === "WAIT_LINE") {
                    if (redCount >= 5) {
                        confirmCount++;
                        if (confirmCount >= 2) {
                            state = "WAIT_BITE";
                            confirmCount = 0;
                            ui.run(function(){
                                wakeUpFloat();
                                floatWin.txtToggle.setText("守望红线...");
                                floatWin.btnToggle.setCardBackgroundColor(Color.parseColor("#825500"));
                            });
                        }
                    } else { confirmCount = 0; }
                }
            } catch (e) {}
            sleep(CONFIG.pollMs);
        }
    });
}

events.on("exit", function () { serviceAlive = false; isListening = false; });
refreshMainUI(); 
checkPermissions();