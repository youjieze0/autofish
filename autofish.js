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
importClass(android.view.animation.AccelerateInterpolator);
importClass(android.view.animation.OvershootInterpolator);
importClass(android.view.animation.LinearInterpolator);
importClass(android.content.res.ColorStateList);
importClass(android.graphics.drawable.GradientDrawable);
importClass(android.provider.Settings);
importClass(android.net.Uri);
importClass(android.content.ComponentName);
importClass(android.view.WindowManager);
importClass(android.graphics.drawable.ColorDrawable);
importClass(android.animation.LayoutTransition);

var CONFIG = {
    workDir:      "/sdcard/AutoFish",
    pollMs:       55,
    pollFastMs:   35,
    landscape:    "auto",
    waitLineMs:   25000,
    maxRecast:    3,
    floatGuard:   0.85,
    guardTickMs:  1000,
    blackFrames:  120,
    nullFrames:   60
};

var THEME = {
    light: {
        bg: "#FEF7FF",
        onBg: "#1C1B1F",
        surface: "#F3EDF7",
        primary: "#6750A4",
        onPrimary: "#FFFFFF",
        primaryContainer: "#EADDFF",
        onPrimaryContainer: "#21005D",
        secondaryContainer: "#E8DEF8",
        onSecondaryContainer: "#1D192B",
        tertiaryContainer: "#FFD8E4",
        onTertiaryContainer: "#31111D",
        surfaceVariant: "#E7E0EC",
        onSurfaceVariant: "#49454F",
        surfaceContainerHigh: "#ECE6F0",
        surfaceContainerHighest: "#E6E0E9",
        outline: "#79747E",
        error: "#B3261E",
        onError: "#FFFFFF",
        errorContainer: "#F9DEDC",
        onErrorContainer: "#410E0B"
    },
    dark: {
        bg: "#141218",
        onBg: "#E6E1E5",
        surface: "#211F26",
        primary: "#D0BCFF",
        onPrimary: "#381E72",
        primaryContainer: "#4F378B",
        onPrimaryContainer: "#EADDFF",
        secondaryContainer: "#4A4458",
        onSecondaryContainer: "#E8DEF8",
        tertiaryContainer: "#633B48",
        onTertiaryContainer: "#FFD8E4",
        surfaceVariant: "#49454F",
        onSurfaceVariant: "#CAC4D0",
        surfaceContainerHigh: "#2B2930",
        surfaceContainerHighest: "#36343B",
        outline: "#938F99",
        error: "#F2B8B5",
        onError: "#601410",
        errorContainer: "#8C1D18",
        onErrorContainer: "#F9DEDC"
    }
};
var storage = storages.create("autofish");

function isDarkMode() {
    var mode = storage.get("uiTheme", "system");
    if (mode === "dark") return true;
    if (mode === "light") return false;
    var uiMode = context.getResources().getConfiguration().uiMode;
    return (uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES;
}

var initIsDark = isDarkMode();
var initBg = initIsDark ? THEME.dark.bg : THEME.light.bg;

ui.statusBarColor(initBg);
activity.getWindow().setBackgroundDrawable(new ColorDrawable(Color.parseColor(initBg)));
activity.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING);

ui.layout(
    <frame id="rootFrame" w="*" h="*">

        <viewpager id="viewPager" w="*" h="*">
            <scroll w="*" h="*">
                <vertical id="mainPage" padding="24 24 24 100" w="*" h="wrap_content" clickable="true">
                    <text id="txtMainTitle" text="自动钓鱼" textSize="30sp" textStyle="bold" gravity="center" marginTop="16" />
                    <text id="txtMainSub" text="红线秒提 · 自定义延迟 · 智能防封" textSize="14sp" gravity="center" marginTop="8" marginBottom="32" />

                    <card id="cardFish" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="btnPickFish" text="① 选定钓鱼键" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <card id="cardMag" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="btnPickMag" text="② 选定放大键" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <card id="cardLine" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="btnPickLine" text="③ 框选红线区域" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <card id="cardStart" w="*" h="72dp" margin="8 32 8 8" cardCornerRadius="24dp" cardElevation="2dp" foreground="?selectableItemBackground">
                        <text id="btnStart" text="④ 开启悬浮窗" textSize="22sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <text id="txtStatus" text="正在检查状态..." textSize="14sp" textStyle="bold" gravity="center" margin="16" />
                    <text id="txtFishCount" text="本工具已为用户钓上 0 鱼" textSize="16sp" textStyle="bold" gravity="center" margin="8" />
                </vertical>
            </scroll>

            <scroll w="*" h="*">
                <vertical id="pageSettings" padding="24 24 24 100" w="*" h="wrap_content" clickable="true">
                    <text id="txtSettingsTitle" text="设置" textSize="30sp" textStyle="bold" marginTop="16" marginBottom="24" />

                    <card id="cardSens" w="*" h="wrap_content" margin="8 0 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <vertical padding="16 20">
                            <text id="txtSensTitle" text="识别灵敏度" textSize="18sp" textStyle="bold" />
                            <text id="txtSensSub" text="过早提杆选「低」，夜里/暗水/识别不到选「高」" textSize="12sp" marginTop="0" marginBottom="12" />

                            <card cardCornerRadius="16dp" cardElevation="0dp" cardBackgroundColor="#00000000">
                                <horizontal w="*" h="40dp">
                                    <card id="btnSensLow" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="0 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtSensLow" text="低" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnSensMid" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtSensMid" text="中" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnSensHigh" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 0 0" foreground="?selectableItemBackground">
                                        <text id="txtSensHigh" text="高" gravity="center" w="*" h="*" />
                                    </card>
                                </horizontal>
                            </card>
                        </vertical>
                    </card>

                    <card id="cardDelay" w="*" h="wrap_content" margin="8 0 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <vertical padding="16 20">
                            <text id="txtDelayTitle" text="收杆后抛竿延迟" textSize="18sp" textStyle="bold" />
                            <text id="txtDelaySub" text="提竿后等待动画播放完毕再抛竿的时间 (毫秒)" textSize="12sp" marginTop="0" marginBottom="12" />
                            <card id="cardDelayInput" w="*" h="wrap_content" cardCornerRadius="12dp" cardElevation="0dp">
                                <input id="inputDelay" inputType="number" textSize="16sp" bg="#00000000" padding="16 12" />
                            </card>
                        </vertical>
                    </card>

                    <card id="cardThemeSet" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <vertical padding="16 20">
                            <text id="txtThemeTitle" text="主题配色" textSize="18sp" textStyle="bold" />
                            <text id="txtThemeSub" text="浅色 / 深色 / 跟随系统" textSize="12sp" marginTop="0" marginBottom="12" />

                            <card cardCornerRadius="16dp" cardElevation="0dp" cardBackgroundColor="#00000000">
                                <horizontal w="*" h="40dp">
                                    <card id="btnThemeLight" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="0 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtThemeLight" text="浅色" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnThemeDark" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtThemeDark" text="深色" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnThemeSystem" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 0 0" foreground="?selectableItemBackground">
                                        <text id="txtThemeSystem" text="跟随系统" gravity="center" w="*" h="*" />
                                    </card>
                                </horizontal>
                            </card>
                        </vertical>
                    </card>

                    <card id="cardHideTask" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtHideTaskTitle" text="隐藏后台任务" textSize="18sp" textStyle="bold" />
                                <text id="txtHideTaskSub" text="开启后在最近任务列表中不显示本应用" textSize="12sp" marginTop="0" />
                            </vertical>

                            <frame id="customSwitch" w="52dp" h="32dp" clickable="true">
                                <card id="switchTrack" w="52dp" h="32dp" cardCornerRadius="16dp" cardElevation="0dp" />
                                <card id="switchThumb" w="24dp" h="24dp" cardCornerRadius="12dp" cardElevation="0dp" layout_gravity="center_vertical|left" marginLeft="4" />
                            </frame>
                        </horizontal>
                    </card>

                    <card id="cardBatteryOpt" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtBatteryTitle" text="关闭电池优化" textSize="18sp" textStyle="bold" />
                                <text id="txtBatterySub" text="防止挂机时被系统杀后台" textSize="12sp" marginTop="0" />
                            </vertical>
                            <card id="btnBatteryGo" w="64dp" h="32dp" marginLeft="8" cardCornerRadius="16dp" cardElevation="0dp" foreground="?selectableItemBackground">
                                <text id="txtBatteryGo" text="去设置" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                            </card>
                        </horizontal>
                    </card>

                    <card id="cardAutoStart" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtAutoStartTitle" text="允许自启动" textSize="18sp" textStyle="bold" />
                                <text id="txtAutoStartSub" text="确保无障碍服务稳定运行" textSize="12sp" marginTop="0" />
                            </vertical>
                            <card id="btnAutoStartGo" w="64dp" h="32dp" marginLeft="8" cardCornerRadius="16dp" cardElevation="0dp" foreground="?selectableItemBackground">
                                <text id="txtAutoStartGo" text="去设置" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                            </card>
                        </horizontal>
                    </card>

                    <card id="cardLog" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtLogTitle" text="识别诊断" textSize="18sp" textStyle="bold" />
                                <text id="txtLogSub" text="悬浮窗实时显示红线判定值，并写入 detect_log.txt" textSize="12sp" marginTop="0" />
                            </vertical>

                            <frame id="logSwitch" w="52dp" h="32dp" clickable="true">
                                <card id="logSwitchTrack" w="52dp" h="32dp" cardCornerRadius="16dp" cardElevation="0dp" />
                                <card id="logSwitchThumb" w="24dp" h="24dp" cardCornerRadius="12dp" cardElevation="0dp" layout_gravity="center_vertical|left" marginLeft="4" />
                            </frame>
                        </horizontal>
                    </card>

                </vertical>
            </scroll>

            <scroll w="*" h="*">
                <vertical id="pageDebug" padding="24 24 24 100" w="*" h="wrap_content" clickable="true">
                    <text id="txtDebugTitle" text="调试" textSize="30sp" textStyle="bold" marginTop="16" marginBottom="24" />

                    <card id="cardFloatToggle" w="*" h="wrap_content" margin="8 0 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtFloatToggleTitle" text="显示弹窗" textSize="18sp" textStyle="bold" />
                                <text id="txtFloatToggleSub" text="控制功能弹窗的显示与隐藏" textSize="12sp" marginTop="0" />
                            </vertical>
                            <frame id="floatShowSwitch" w="52dp" h="32dp" clickable="true">
                                <card id="floatShowSwitchTrack" w="52dp" h="32dp" cardCornerRadius="16dp" cardElevation="0dp" />
                                <card id="floatShowSwitchThumb" w="24dp" h="24dp" cardCornerRadius="12dp" cardElevation="0dp" layout_gravity="center_vertical|left" marginLeft="4" />
                            </frame>
                        </horizontal>
                    </card>

                    <card id="cardTestFloat" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtTestFloatTitle" text="显示弹窗" textSize="18sp" textStyle="bold" />
                                <text id="txtTestFloatSub" text="点击显示一个测试弹窗" textSize="12sp" marginTop="0" />
                            </vertical>
                            <card id="btnTestFloat" w="80dp" h="32dp" marginLeft="8" cardCornerRadius="16dp" cardElevation="0dp" foreground="?selectableItemBackground">
                                <text id="txtTestFloat" text="点击显示" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                            </card>
                        </horizontal>
                    </card>

                    <card id="cardPopupSide" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtPopupSideTitle" text="弹窗位置" textSize="18sp" textStyle="bold" />
                                <text id="txtPopupSideSub" text="弹窗吸附在左边缘还是右边缘" textSize="12sp" marginTop="0" />
                            </vertical>
                            <card cardCornerRadius="16dp" cardElevation="0dp" cardBackgroundColor="#00000000">
                                <horizontal w="wrap_content" h="40dp">
                                    <card id="btnPopupLeft" w="56dp" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="0 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtPopupLeft" text="左" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnPopupRight" w="56dp" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 0 0" foreground="?selectableItemBackground">
                                        <text id="txtPopupRight" text="右" gravity="center" w="*" h="*" />
                                    </card>
                                </horizontal>
                            </card>
                        </horizontal>
                    </card>
                </vertical>
            </scroll>
        </viewpager>

        <card id="bottomNav" w="wrap_content" h="64dp" cardElevation="6dp" cardCornerRadius="32dp" layout_gravity="bottom|center_horizontal" marginBottom="24">
            <frame w="wrap_content" h="wrap_content" layout_gravity="center" padding="8 0">
                <frame id="navIndicator" w="100dp" h="48dp" layout_gravity="center_vertical|left" />

                <horizontal w="wrap_content" h="wrap_content" gravity="center">
                    <frame id="tabHomeWrap" w="100dp" h="48dp">
                        <text id="txtTabHome" text="主页" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </frame>
                    <frame id="tabSettingsWrap" w="100dp" h="48dp" marginLeft="4">
                        <text id="txtTabSettings" text="设置" textSize="16sp" textStyle="normal" gravity="center" w="*" h="*" />
                    </frame>
                    <frame id="tabDebugWrap" w="100dp" h="48dp" marginLeft="4">
                        <text id="txtTabDebug" text="调试" textSize="16sp" textStyle="normal" gravity="center" w="*" h="*" />
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
var switchMovePx = 20 * density;
var serviceAlive = false;
var isListening = false;
var screenCaptureReady = false;
var floatWinGlobal = null;
var floatSpinStop = null;
var fishTotal = Number(storage.get("fishTotal", 0)) || 0;
var sessionFish = 0;
var popupWin = null;
var popupAnimTimer = null;
var popupTimer = null;
var popupEnabled = storage.get("popupEnabled", true) !== false;
var popupX = 0;
var popupY = storage.get("popupY", -1);
var popupSide = storage.get("popupSide", "right");
var popupW = 0;
var popupH = 0;

function updateThemeUI() {
    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    ui.run(function() {
        try {
            var window = activity.getWindow();
            window.setStatusBarColor(Color.parseColor(c.bg));
            window.setBackgroundDrawable(new ColorDrawable(Color.parseColor(c.bg)));
            var decor = window.getDecorView();
            if (isDark) {
                decor.setSystemUiVisibility(decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            } else {
                decor.setSystemUiVisibility(decor.getSystemUiVisibility() | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            }
        } catch(e) {}

        ui.rootFrame.setBackgroundColor(Color.parseColor(c.bg));

        ui.txtMainTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtMainSub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.txtSettingsTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtDebugTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardHideTask.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtHideTaskTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtHideTaskSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardDelay.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtDelayTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtDelaySub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.cardDelayInput.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        ui.inputDelay.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardThemeSet.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtThemeTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtThemeSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardBatteryOpt.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtBatteryTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtBatterySub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.btnBatteryGo.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        ui.txtBatteryGo.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardAutoStart.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtAutoStartTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtAutoStartSub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.btnAutoStartGo.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        ui.txtAutoStartGo.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardSens.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtSensTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtSensSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardLog.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtLogTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtLogSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardFloatToggle.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtFloatToggleTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtFloatToggleSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardTestFloat.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtTestFloatTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtTestFloatSub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.btnTestFloat.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        ui.txtTestFloat.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardPopupSide.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtPopupSideTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtPopupSideSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.bottomNav.setCardBackgroundColor(Color.parseColor(c.surface));

        var indicatorBg = new GradientDrawable();
        indicatorBg.setShape(GradientDrawable.RECTANGLE);
        indicatorBg.setCornerRadius(24 * density);
        indicatorBg.setColor(Color.parseColor(c.primaryContainer));
        ui.navIndicator.setBackground(indicatorBg);

        var idx = ui.viewPager.getCurrentItem();
        ui.txtTabHome.setTextColor(Color.parseColor(idx === 0 ? c.onPrimaryContainer : c.onSurfaceVariant));
        ui.txtTabHome.setTypeface(null, idx === 0 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
        ui.txtTabSettings.setTextColor(Color.parseColor(idx === 1 ? c.onPrimaryContainer : c.onSurfaceVariant));
        ui.txtTabSettings.setTypeface(null, idx === 1 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
        ui.txtTabDebug.setTextColor(Color.parseColor(idx === 2 ? c.onPrimaryContainer : c.onSurfaceVariant));
        ui.txtTabDebug.setTypeface(null, idx === 2 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);

        refreshMainUI();
        updateSwitchUI(storage.get("hideTask", false), false);
        updateLogSwitchUI(storage.get("debugLog", false), false);
        updateThemeSelectorUI();
        updateSensSelectorUI();
        refreshFishCount();
        updatePopupSwitchUI(popupEnabled, false);
        updatePopupSideSelectorUI();
    });
}

function applySegment(btns, txts, states, value) {
    var c = isDarkMode() ? THEME.dark : THEME.light;
    ui.run(function() {
        for (var i = 0; i < states.length; i++) {
            if (states[i] === value) {
                btns[i].setCardBackgroundColor(Color.parseColor(c.primaryContainer));
                txts[i].setTextColor(Color.parseColor(c.onPrimaryContainer));
                txts[i].setTypeface(null, android.graphics.Typeface.BOLD);
            } else {
                btns[i].setCardBackgroundColor(Color.parseColor(c.bg));
                txts[i].setTextColor(Color.parseColor(c.onSurfaceVariant));
                txts[i].setTypeface(null, android.graphics.Typeface.NORMAL);
            }
        }
    });
}

function updateThemeSelectorUI() {
    applySegment([ui.btnThemeLight, ui.btnThemeDark, ui.btnThemeSystem],
                 [ui.txtThemeLight, ui.txtThemeDark, ui.txtThemeSystem],
                 ["light", "dark", "system"], storage.get("uiTheme", "system"));
}

function updateSensSelectorUI() {
    applySegment([ui.btnSensLow, ui.btnSensMid, ui.btnSensHigh],
                 [ui.txtSensLow, ui.txtSensMid, ui.txtSensHigh],
                 ["low", "mid", "high"], storage.get("sensLevel", "mid"));
}

function applySwitch(thumb, track, isOn, animate) {
    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    var targetX = isOn ? switchMovePx : 0;
    var trackColor = isOn ? c.primary : c.surfaceVariant;
    var thumbColor = isOn ? c.onPrimary : c.onSurfaceVariant;

    ui.run(function(){
        if (animate) {
            thumb.animate().translationX(targetX).setDuration(200).setInterpolator(new DecelerateInterpolator()).start();
        } else {
            thumb.setTranslationX(targetX);
        }
        track.setCardBackgroundColor(Color.parseColor(trackColor));
        thumb.setCardBackgroundColor(Color.parseColor(thumbColor));
    });
}

function updateSwitchUI(isOn, animate) {
    applySwitch(ui.switchThumb, ui.switchTrack, isOn, animate);
}

function updateLogSwitchUI(isOn, animate) {
    applySwitch(ui.logSwitchThumb, ui.logSwitchTrack, isOn, animate);
}

function updatePopupSwitchUI(isOn, animate) {
    applySwitch(ui.floatShowSwitchThumb, ui.floatShowSwitchTrack, isOn, animate);
}

function updatePopupSideSelectorUI() {
    applySegment([ui.btnPopupLeft, ui.btnPopupRight],
                 [ui.txtPopupLeft, ui.txtPopupRight],
                 ["left", "right"], popupSide);
}

function refreshFishCount() {
    var c = isDarkMode() ? THEME.dark : THEME.light;
    ui.run(function () {
        try {
            ui.txtFishCount.setText("本工具已为用户钓上 " + fishTotal + " 鱼");
            ui.txtFishCount.setTextColor(Color.parseColor(c.onPrimaryContainer));
        } catch (e) {}
    });
}

function closeFloatSystem() {
    serviceAlive = false;
    isListening = false;
    try { if (floatSpinStop) floatSpinStop(); } catch (e) {}
    try { if (floatWinGlobal) floatWinGlobal.close(); } catch (e) {}
    floatWinGlobal = null;
    floatSpinStop = null;
}

function closePopupNow() {
    if (popupAnimTimer) { try { clearInterval(popupAnimTimer); } catch (e) {} popupAnimTimer = null; }
    if (popupTimer) { try { clearTimeout(popupTimer); } catch (e) {} popupTimer = null; }
    if (popupWin) { try { popupWin.close(); } catch (e) {} popupWin = null; }
}

function slidePopupTo(targetX, fadeIn, onDone) {
    if (popupAnimTimer) { try { clearInterval(popupAnimTimer); } catch (e) {} popupAnimTimer = null; }
    var startX = popupX;
    var steps = 10, i = 0;
    popupAnimTimer = setInterval(function () {
        i++;
        var t = i / steps; if (t > 1) t = 1;
        var e = 1 - Math.pow(1 - t, 3);
        popupX = startX + (targetX - startX) * e;
        try {
            if (popupWin) {
                popupWin.setPosition(Math.round(popupX), Math.round(popupY));
                popupWin.popupCard.setAlpha(fadeIn ? e : (1 - e));
            }
        } catch (e) {}
        if (i >= steps) {
            try { clearInterval(popupAnimTimer); } catch (e) {}
            popupAnimTimer = null;
            popupX = targetX;
            if (onDone) onDone();
        }
    }, 20);
}

function popupEdgeX() {
    if (popupSide === "right") {
        var dm = context.getResources().getDisplayMetrics();
        return dm.widthPixels - popupW;
    }
    return 0;
}

function popupOutX() {
    if (popupSide === "right") {
        var dm = context.getResources().getDisplayMetrics();
        return dm.widthPixels;
    }
    return -popupW;
}

function startPopupProgress() {
    if (!popupWin) return;
    try {
        popupWin.popupProgress.setScaleX(1.0);
        popupWin.popupProgress.setPivotX(popupSide === "right" ? 0 : popupW);
        popupWin.popupProgress.animate().scaleX(0).setDuration(2000).setInterpolator(new LinearInterpolator()).start();
    } catch (e) {}
}

function schedulePopupDismiss() {
    if (popupTimer) { try { clearTimeout(popupTimer); } catch (e) {} popupTimer = null; }
    startPopupProgress();
    popupTimer = setTimeout(function () {
        popupTimer = null;
        slidePopupTo(popupOutX(), false, function () { closePopupNow(); });
    }, 2000);
}

function attachPopupDrag(win) {
    var sy = 0, sp = 0;
    win.popupCard.setOnTouchListener(function (view, event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                sy = event.getRawY(); sp = popupY;
                if (popupTimer) { try { clearTimeout(popupTimer); } catch (e) {} popupTimer = null; }
                if (popupAnimTimer) { try { clearInterval(popupAnimTimer); } catch (e) {} popupAnimTimer = null; }
                return true;
            case MotionEvent.ACTION_MOVE:
                popupY = sp + (event.getRawY() - sy);
                var dm = context.getResources().getDisplayMetrics();
                var maxY = dm.heightPixels - (popupH > 0 ? popupH : 120);
                if (popupY < 0) popupY = 0;
                if (popupY > maxY) popupY = maxY;
                popupX = popupEdgeX();
                try { win.setPosition(Math.round(popupX), Math.round(popupY)); } catch (e) {}
                return true;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                storage.put("popupY", popupY);
                schedulePopupDismiss();
                return true;
        }
        return true;
    });
}

function showPopup(msg) {
    if (!popupEnabled) return;
    ui.run(function () {
        try {
            closePopupNow();
            var dm = context.getResources().getDisplayMetrics();
            if (popupY < 0) popupY = Math.round(dm.heightPixels * 0.35);
            if (popupY > dm.heightPixels - 60) popupY = dm.heightPixels - 60;
            if (popupY < 0) popupY = 0;
            popupWin = floaty.window(
                <frame>
                    <frame id="popupCard" w="wrap_content" h="wrap_content">
                        <frame id="popupProgress" w="*" h="*" />
                        <text id="popupText" w="wrap_content" h="wrap_content" textSize="13sp" textStyle="bold" gravity="center" padding="16 9" />
                    </frame>
                </frame>
            );
            popupWin.popupText.setText(msg);
            var isDark = isDarkMode();
            popupWin.popupText.setTextColor(Color.parseColor(isDark ? "#FFFFFF" : "#1C1B1F"));
            var pg = new GradientDrawable();
            pg.setShape(GradientDrawable.RECTANGLE);
            var r = 12 * density;
            if (popupSide === "right") pg.setCornerRadii([r, r, 0, 0, 0, 0, r, r]);
            else pg.setCornerRadii([0, 0, r, r, r, r, 0, 0]);
            pg.setColor(Color.parseColor(isDark ? "#E6000000" : "#E6FFFFFF"));
            popupWin.popupCard.setBackground(pg);
            var pp = new GradientDrawable();
            pp.setShape(GradientDrawable.RECTANGLE);
            pp.setColor(Color.parseColor(isDark ? "#A0D0BCFF" : "#A06750A4"));
            popupWin.popupProgress.setBackground(pp);
            try { popupWin.popupCard.setClipToOutline(true); } catch (e) {}
            attachPopupDrag(popupWin);
            popupX = (popupSide === "right") ? dm.widthPixels : -dm.widthPixels;
            popupWin.setPosition(Math.round(popupX), Math.round(popupY));
            setTimeout(function () {
                try {
                    popupW = popupWin.popupCard.getWidth();
                    popupH = popupWin.popupCard.getHeight();
                    var pyMax = dm.heightPixels - popupH;
                    if (popupY > pyMax) popupY = pyMax;
                    if (popupY < 0) popupY = 0;
                    try {
                        var plp = popupWin.popupProgress.getLayoutParams();
                        plp.width = popupW;
                        plp.height = popupH;
                        popupWin.popupProgress.setLayoutParams(plp);
                    } catch (e) {}
                    popupX = (popupSide === "right") ? dm.widthPixels : -popupW;
                    popupWin.setPosition(Math.round(popupX), Math.round(popupY));
                    slidePopupTo(popupEdgeX(), true, function () { schedulePopupDismiss(); });
                } catch (e) {}
            }, 50);
        } catch (e) {}
    });
}

var logFlushHook = null;

function isDebugOn() {
    try { return storage.get("debugLog", false) === true; } catch (e) { return false; }
}

ui.run(function(){
    try { if (activity.getActionBar()) activity.getActionBar().hide(); } catch(e) {}
    try { if (activity.getSupportActionBar && activity.getSupportActionBar()) activity.getSupportActionBar().hide(); } catch(e) {}
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

    var delaySaved = storage.get("fishDelay", 10000);
    ui.inputDelay.setText(String(delaySaved));

    var hideSaved = storage.get("hideTask", false);
    try {
        var am = context.getSystemService(Context.ACTIVITY_SERVICE);
        var tasks = am.getAppTasks();
        if (tasks != null && tasks.size() > 0) {
            tasks.get(0).setExcludeFromRecents(hideSaved);
        }
    } catch(e) {}

    updateThemeUI();
});

ui.emitter.on("resume", function() {
    updateThemeUI();
});

ui.pageSettings.setOnTouchListener(function(view, event) {
    if (event.getAction() == MotionEvent.ACTION_DOWN) {
        if (ui.inputDelay.isFocused()) {
            ui.inputDelay.clearFocus();
            try {
                var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
            } catch(e) {}
        }
    }
    return false;
});

ui.mainPage.setOnTouchListener(function(view, event) {
    if (event.getAction() == MotionEvent.ACTION_DOWN) {
        if (ui.inputDelay.isFocused()) {
            ui.inputDelay.clearFocus();
            try {
                var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
            } catch(e) {}
        }
    }
    return false;
});

ui.btnThemeLight.click(function() { storage.put("uiTheme", "light"); updateThemeUI(); showPopup("主题颜色 浅色"); });
ui.btnThemeDark.click(function() { storage.put("uiTheme", "dark"); updateThemeUI(); showPopup("主题颜色 深色"); });
ui.btnThemeSystem.click(function() { storage.put("uiTheme", "system"); updateThemeUI(); showPopup("主题颜色 系统"); });

ui.customSwitch.click(function() {
    var current = storage.get("hideTask", false);
    var nextState = !current;
    storage.put("hideTask", nextState);
    updateSwitchUI(nextState, true);

    try {
        var am = context.getSystemService(Context.ACTIVITY_SERVICE);
        var tasks = am.getAppTasks();
        if (tasks != null && tasks.size() > 0) {
            tasks.get(0).setExcludeFromRecents(nextState);
        }
    } catch(e) {}
});

ui.logSwitch.click(function() {
    var next = !storage.get("debugLog", false);
    storage.put("debugLog", next);
    updateLogSwitchUI(next, true);
    if (!next && logFlushHook) { try { logFlushHook(); } catch (e) {} }
    if (next) toast("已开启识别诊断：悬浮窗将显示红线判定值");
});

function setSensLevel(level) {
    storage.put("sensLevel", level);
    detectOpts = getDetectOpts(level);
    updateSensSelectorUI();
    refreshMainUI();
    showPopup("识别灵敏度 " + sensName(level));
}

ui.btnSensLow.click(function() { setSensLevel("low"); });
ui.btnSensMid.click(function() { setSensLevel("mid"); });
ui.btnSensHigh.click(function() { setSensLevel("high"); });

ui.btnBatteryGo.click(function() {
    try {
        var intent = new Intent();
        intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
        intent.setData(Uri.parse("package:" + context.getPackageName()));
        context.startActivity(intent);
    } catch(e) {
        try {
            app.startActivity({action: "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"});
        } catch(e2) {
            toast("自动跳转失败，请手动前往系统设置修改");
        }
    }
});

ui.btnAutoStartGo.click(function() {
    var intent = new Intent();
    var success = false;
    var pkg = context.getPackageName();
    var componentList = [
        new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"),
        new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"),
        new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"),
        new ComponentName("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"),
        new ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"),
        new ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"),
        new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
        new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity")
    ];
    for (var i = 0; i < componentList.length; i++) {
        try {
            intent.setComponent(componentList[i]);
            context.startActivity(intent);
            success = true;
            break;
        } catch(e) {}
    }
    if (!success) {
        try {
            app.startActivity({
                action: "android.settings.APPLICATION_DETAILS_SETTINGS",
                data: "package:" + pkg
            });
            toast("未匹配到系统捷径，请在此处手动寻找【自启动】并开启");
        } catch(e) {
            toast("自动跳转失败，请手动前往设置");
        }
    }
});

ui.inputDelay.addTextChangedListener({
    afterTextChanged: function(s) {
        try {
            var val = parseInt(s.toString());
            if (!isNaN(val) && val >= 0) {
                storage.put("fishDelay", val);
            }
        } catch(e) {}
    }
});

ui.tabHomeWrap.click(function() {
    ui.run(function(){
        ui.inputDelay.clearFocus();
        try {
            var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
        } catch(e) {}
    });
    ui.viewPager.setCurrentItem(0, true);
});

ui.tabSettingsWrap.click(function() {
    ui.viewPager.setCurrentItem(1, true);
});

ui.tabDebugWrap.click(function() {
    ui.viewPager.setCurrentItem(2, true);
});

ui.floatShowSwitch.click(function () {
    popupEnabled = !popupEnabled;
    storage.put("popupEnabled", popupEnabled);
    updatePopupSwitchUI(popupEnabled, true);
});

ui.btnTestFloat.click(function () { showPopup("测试弹窗"); });
ui.btnPopupLeft.click(function () { popupSide = "left"; storage.put("popupSide", "left"); updatePopupSideSelectorUI(); });
ui.btnPopupRight.click(function () { popupSide = "right"; storage.put("popupSide", "right"); updatePopupSideSelectorUI(); });

ui.viewPager.setOnPageChangeListener({
    onPageSelected: function(index) {
        ui.run(function(){
            ui.inputDelay.clearFocus();
            try {
                var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
            } catch(e) {}
        });

        var targetX = index * moveDistPx;
        var isDark = isDarkMode();
        var c = isDark ? THEME.dark : THEME.light;

        ui.run(function() {
            ui.navIndicator.animate()
                .translationX(targetX)
                .setDuration(300)
                .setInterpolator(new DecelerateInterpolator(1.5))
                .start();

            ui.txtTabHome.setTextColor(Color.parseColor(index === 0 ? c.onPrimaryContainer : c.onSurfaceVariant));
            ui.txtTabHome.setTypeface(null, index === 0 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
            ui.txtTabSettings.setTextColor(Color.parseColor(index === 1 ? c.onPrimaryContainer : c.onSurfaceVariant));
            ui.txtTabSettings.setTypeface(null, index === 1 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
            ui.txtTabDebug.setTextColor(Color.parseColor(index === 2 ? c.onPrimaryContainer : c.onSurfaceVariant));
            ui.txtTabDebug.setTypeface(null, index === 2 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
        });
    }
});

function refreshMainUI() {
    var fx = storage.get("fishX"), mx = storage.get("magX"), region = storage.get("lineRegion");
    var missing = [];
    if (fx == null) missing.push("① 钓鱼键未选定");
    if (mx == null) missing.push("② 放大键未选定");
    if (region == null) missing.push("③ 红线区域未选定");

    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    ui.run(function () {
        ui.cardFish.setCardBackgroundColor(Color.parseColor(fx != null ? c.primaryContainer : c.surface));
        ui.btnPickFish.setText(fx != null ? "① 已选定钓鱼键" : "① 选定钓鱼键");
        ui.btnPickFish.setTextColor(Color.parseColor(fx != null ? c.onPrimaryContainer : c.onSurfaceVariant));

        ui.cardMag.setCardBackgroundColor(Color.parseColor(mx != null ? c.primaryContainer : c.surface));
        ui.btnPickMag.setText(mx != null ? "② 已选定放大键" : "② 选定放大键");
        ui.btnPickMag.setTextColor(Color.parseColor(mx != null ? c.onPrimaryContainer : c.onSurfaceVariant));

        ui.cardLine.setCardBackgroundColor(Color.parseColor(region != null ? c.primaryContainer : c.surface));
        ui.btnPickLine.setText(region != null ? "③ 已框选红线" : "③ 框选红线区域");
        ui.btnPickLine.setTextColor(Color.parseColor(region != null ? c.onPrimaryContainer : c.onSurfaceVariant));

        if (missing.length > 0) {
            ui.cardStart.setCardBackgroundColor(Color.parseColor(c.error));
            ui.txtStatus.setText("【尚有未完成步骤】\n" + missing.join(" , "));
            ui.txtStatus.setTextColor(Color.parseColor(c.error));
            ui.btnStart.setTextColor(Color.parseColor(c.onError));
        } else {
            ui.cardStart.setCardBackgroundColor(Color.parseColor(c.primary));
            ui.txtStatus.setText("准备就绪 · 识别引擎 v2 · 灵敏度：" + sensName(storage.get("sensLevel", "mid")));
            ui.txtStatus.setTextColor(Color.parseColor(c.primary));
            ui.btnStart.setTextColor(Color.parseColor(c.onPrimary));
        }
    });
}

ui.cardFish.click(function () { openSelectKey("fishX", "fishY", "fishSrc", "请框选【钓鱼按键】"); });
ui.cardMag.click(function () { openSelectKey("magX", "magY", "magSrc", "请框选【放大按键】"); });
ui.cardLine.click(function () { openSelectRegion(); });
ui.cardStart.click(function () {
    threads.start(startSystem);
});

function openSelectKey(storeX, storeY, srcKey, title) {
    toast("请从相册选择截图，随后完成框选");
    pickImage(function (imgPath) {
        if (!imgPath) return;
        var srcImg = loadCropImage(imgPath);
        if (srcImg == null) return;
        warnImageMismatch(srcImg);
        storage.put(srcKey, JSON.stringify([srcImg.getWidth(), srcImg.getHeight()]));

        launchCropPage(srcImg, title, function (rect) {
            var cx = Math.round(rect.x + rect.w / 2), cy = Math.round(rect.y + rect.h / 2);
            storage.put(storeX, cx); storage.put(storeY, cy);
            toast("坐标已保存"); refreshMainUI();
            showPopup((storeX === "fishX" ? "钓鱼键" : "放大键") + " 图片 已上传");
        });
    });
}

function openSelectRegion() {
    toast("框住浮漂在等待时上下浮动的整个范围：上下各留出它浮动的余量，左右留一点水面");
    pickImage(function (imgPath) {
        if (!imgPath) return;
        var srcImg = loadCropImage(imgPath);
        if (srcImg == null) return;
        warnImageMismatch(srcImg);
        storage.put("lineRegionSrc", JSON.stringify([srcImg.getWidth(), srcImg.getHeight()]));

        launchCropPage(srcImg, "框住浮漂整个浮动范围", function (rect) {
            var region = [Math.round(rect.x), Math.round(rect.y), Math.round(rect.w), Math.round(rect.h)];
            storage.put("lineRegion", JSON.stringify(region));
            toast("红线区域已保存"); refreshMainUI();
            showPopup("红线区域 图片 已上传");
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
        if (lastTempFile) { try { files.remove(lastTempFile); } catch (e) {} lastTempFile = null; }

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

function detectLandscape() {
    if (CONFIG.landscape === true || CONFIG.landscape === false) return CONFIG.landscape;
    try {
        var raw = storage.get("lineRegionSrc");
        if (raw == null) raw = storage.get("fishSrc");
        if (raw != null) {
            var a = JSON.parse(raw);
            if (a[0] > 0 && a[1] > 0) return a[0] >= a[1];
        }
    } catch (e) {}
    return true;
}

function ensureScreenCapture() {
    if (screenCaptureReady) return true;
    for (var i = 0; i < 3; i++) {
        try {
            if (requestScreenCapture(detectLandscape())) { screenCaptureReady = true; return true; }
        } catch (e) {}
        sleep(400);
    }
    return false;
}

function checkPermissions() {
    if (auto.service == null) {
        toast("请先开启本应用的无障碍服务，否则无法点击");
        try { app.startActivity({ action: "android.settings.ACCESSIBILITY_SETTINGS" }); } catch (e) {}
        return false;
    }
    if (!floaty.checkPermission()) {
        toast("请先授予悬浮窗权限");
        try { app.startActivity({ action: "android.settings.action.MANAGE_OVERLAY_PERMISSION", data: "package:" + context.getPackageName() }); } catch (e) {}
        return false;
    }
    return true;
}

var pendingPicks = {};
var pickSeq = 1000;
var lastTempFile = null;

ui.emitter.on("activity_result", function (req, res, data) {
    var cb = pendingPicks[req];
    if (cb == null) return;
    delete pendingPicks[req];
    if (res !== Activity.RESULT_OK || data == null) { cb(null); return; }
    threads.start(function () { var path = uriToLocalPath(data.getData()); ui.run(function () { cb(path); }); });
});

function pickImage(callback) {
    pickSeq++;
    pendingPicks[pickSeq] = callback;
    ui.run(function () { activity.startActivityForResult(new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI), pickSeq); });
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
            lastTempFile = path;
        } catch (e) { return null; }
    }
    return path;
}

function cleanTmpFiles() {
    try {
        if (!files.exists(CONFIG.workDir)) return;
        var names = files.listDir(CONFIG.workDir, function (n) { return /tmp_.*\.png$/.test(n); });
        for (var i = 0; i < names.length; i++) {
            var full = ("" + names[i]).indexOf("/") >= 0 ? names[i] : files.join(CONFIG.workDir, names[i]);
            try { files.remove(full); } catch (e) {}
        }
    } catch (e) {}
}

function loadCropImage(path) {
    try {
        var img = images.read(path);
        if (img == null) { toast("图片读取失败，请换一张截图"); return null; }
        return img;
    } catch (e) {
        toast("图片读取失败：" + e);
        return null;
    }
}

function warnImageMismatch(img) {
    try {
        var dm = context.getResources().getDisplayMetrics();
        var sw = dm.widthPixels, sh = dm.heightPixels;
        var iw = img.getWidth(), ih = img.getHeight();
        if ((iw > ih) !== (sw > sh)) { toast("提示：该截图方向与当前屏幕不一致，坐标可能偏移"); return; }
        var kx = sw / iw, ky = sh / ih;
        if (Math.abs(kx - ky) / kx > 0.03) toast("提示：该截图疑似裁剪过，坐标可能偏移，建议用整屏截图");
    } catch (e) {}
}

function inputStreamToBytes(is) { var baos = new ByteArrayOutputStream(), buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096), n; while ((n = is.read(buf)) !== -1) { baos.write(buf, 0, n); } is.close(); return baos.toByteArray(); }
function doClick(x, y) { try { click(x, y); } catch (e) { gesture(80, [x, y]); } }

var SENS_PRESETS = {
    low:  { delta: 32, absFloor: 16, deltaG: 32, absFloorG: 14, topGoneMs: 250, topGoneRatio: 0.60, minHits: 8, dropRatio: 0.15, backRatio: 0.55, dropMs: 450, backMs: 320, bufMax: 3, fastRatio: 0.08, fastFrames: 3, fastMs: 300, armRatio: 0.20, armFrames: 5 },
    mid:  { delta: 24, absFloor: 12, deltaG: 24, absFloorG: 10, topGoneMs: 130, topGoneRatio: 0.85, minHits: 5, dropRatio: 0.30, backRatio: 0.60, dropMs: 250, backMs: 260, bufMax: 3, fastRatio: 0.15, fastFrames: 2, fastMs: 120, armRatio: 0.15, armFrames: 4 },
    high: { delta: 20, absFloor: 10, deltaG: 20, absFloorG: 8, topGoneMs: 80, topGoneRatio: 0.95, minHits: 3, dropRatio: 0.42, backRatio: 0.65, dropMs: 150, backMs: 200, bufMax: 3, fastRatio: 0.24, fastFrames: 2, fastMs: 70, armRatio: 0.08, armFrames: 3 }
};

function getDetectOpts(level) { return SENS_PRESETS[level] || SENS_PRESETS.mid; }
function sensName(level) { return level === "low" ? "低" : (level === "high" ? "高" : "中"); }

function analyzeRedRegion(px, rw, rh, o, cache, mask) {
    var histR = (cache && cache.histR) ? cache.histR : new Array(512);
    var histG = (cache && cache.histG) ? cache.histG : new Array(512);
    if (cache) { cache.histR = histR; cache.histG = histG; }
    var i;
    for (i = 0; i < 512; i++) { histR[i] = 0; histG[i] = 0; }

    var hasMask = (mask != null);
    var mx0 = hasMask ? mask.x0 : 0, mx1 = hasMask ? mask.x1 : -1;
    var my0 = hasMask ? mask.y0 : 0, my1 = hasMask ? mask.y1 : -1;
    var lumaSum = 0, lumaN = 0, x, y, rowOff, inMaskRow, c, r, g, b, red, grn, bi, mx, mn;

    for (y = 0; y < rh; y++) {
        rowOff = y * rw;
        inMaskRow = hasMask && (y >= my0) && (y <= my1);
        for (x = 0; x < rw; x++) {
            if (inMaskRow && x >= mx0 && x <= mx1) continue;
            c = px[rowOff + x];
            r = (c >> 16) & 0xff; g = (c >> 8) & 0xff; b = c & 0xff;
            mx = g > b ? g : b; mn = g < b ? g : b;
            red = r - mx;
            bi = red + 255; if (bi < 0) bi = 0; else if (bi > 511) bi = 511;
            histR[bi]++;
            mx = r > b ? r : b; mn = r < b ? r : b;
            grn = g - mx;
            bi = grn + 255; if (bi < 0) bi = 0; else if (bi > 511) bi = 511;
            histG[bi]++;
            lumaSum += (r + r + r + g + g + g + b + b) >> 3;
            lumaN++;
        }
    }
    if (lumaN === 0) return { score: 0, hits: 0, thr: 0, bgRed: 0, mean: 0, rw: rw, rh: rh, pixels: 0, redTop: -1, redRows: 0, greenTop: -1, gHits: 0 };

    var want = Math.round(lumaN * 0.20), acc = 0, bgRed = -255, bgGreen = -255;
    for (i = 0; i < 512; i++) {
        acc += histR[i];
        if (acc >= want) { bgRed = i - 255; break; }
    }
    acc = 0;
    for (i = 0; i < 512; i++) {
        acc += histG[i];
        if (acc >= want) { bgGreen = i - 255; break; }
    }

    var thr = bgRed + o.delta;
    if (thr < o.absFloor) thr = o.absFloor;
    var gthr = bgGreen + o.deltaG;
    if (gthr < o.absFloorG) gthr = o.absFloorG;

    var hits = 0, score = 0, redTop = -1, redBot = -1, redRows = 0;
    var gHits = 0, greenTop = -1;
    for (y = 0; y < rh; y++) {
        rowOff = y * rw;
        inMaskRow = hasMask && (y >= my0) && (y <= my1);
        var rowRed = 0, rowGreen = 0;
        for (x = 0; x < rw; x++) {
            if (inMaskRow && x >= mx0 && x <= mx1) continue;
            c = px[rowOff + x];
            r = (c >> 16) & 0xff; g = (c >> 8) & 0xff; b = c & 0xff;
            red = r - (g > b ? g : b);
            if (red >= thr) { hits++; score += red - thr; rowRed++; }
            grn = g - (r > b ? r : b);
            if (grn >= gthr) { gHits++; rowGreen++; if (greenTop < 0) greenTop = y; }
        }
        if (rowRed > 0) { redRows++; if (redTop < 0) redTop = y; redBot = y; }
    }
    return {
        score: score, hits: hits, thr: thr, bgRed: bgRed, gthr: gthr, bgGreen: bgGreen,
        mean: lumaN > 0 ? lumaSum / lumaN : 0, rw: rw, rh: rh, pixels: lumaN,
        redTop: redTop, redBot: redBot, redRows: redRows, greenTop: greenTop, gHits: gHits
    };
}

function lineScoreOf(res, o) {
    if (!res) return 0;
    if (res.hits < o.minHits) return 0;
    return res.score;
}

function medianOf(arr) {
    var n = arr.length; if (n === 0) return 0;
    var t = arr.slice(0), i, j, v;
    for (i = 1; i < n; i++) { v = t[i]; j = i - 1; while (j >= 0 && t[j] > v) { t[j + 1] = t[j]; j--; } t[j + 1] = v; }
    return (n % 2) ? t[(n - 1) / 2] : (t[n / 2 - 1] + t[n / 2]) / 2;
}


function createDetector(o, regionH) {
    return {
        opts: o, buf: [], base: 0, stage: "ACQUIRE", armHits: 0, armNeed: 12, fastMode: false,
        markKind: "", markMs: 0, lastRaw: 0, lastScore: 0, armAt: 0, latch: false, backLatch: false,
        rawRing: [], fastPending: false, posValid: false, topMode: false, baseRows: 0,
        minBase: Math.max(16, Math.round((regionH || 40) * 0.10))
    };
}

function detectorReset(det) {
    det.stage = "ACQUIRE";
    det.base = 0;
    det.armHits = 0;
    det.armAt = 0;
    det.fastMode = false;
    det.buf = [];
    det.markKind = "";
    det.markMs = 0;
    det.latch = false;
    det.backLatch = false;
    det.rawRing = [];
    det.fastPending = false;
    det.posValid = false;
    det.topMode = false;
    det.baseRows = 0;
}

function detectorStep(det, rawScore, now, phase, hits, pos) {
    var o = det.opts;
    if (hits == null) hits = rawScore > 0 ? 1e9 : 0;
    var topGone = false, posUsable = false;
    if (pos != null && det.posValid && det.baseRows > 0) {
        posUsable = true;
        if (pos.redTop < 0) topGone = true;
        else if (pos.greenTop < 0 && pos.redRows <= det.baseRows * o.topGoneRatio) topGone = true;
    }
    det.lastRaw = rawScore;
    det.buf.push(rawScore);
    while (det.buf.length > o.bufMax) det.buf.shift();
    var s = medianOf(det.buf);
    det.lastScore = s;

    if (det.stage === "ACQUIRE") {
        if (rawScore >= det.minBase && s >= det.minBase && hits >= det.armNeed) det.armHits++; else det.armHits = 0;
        if (det.armHits >= o.armFrames) {
            det.base = Math.max(s, det.minBase);
            det.stage = "ARMED";
            det.armHits = 0;
            det.armAt = now;
            det.markKind = ""; det.markMs = 0;
            return { action: "acquired", score: s, base: det.base, ratio: 1 };
        }
        return { action: "searching", score: s, base: 0, ratio: 0 };
    }

    var ratio = det.base > 0 ? s / det.base : 0;

    if (phase === "BITE") {
        if (now - det.armAt < 600) {
            if (s >= det.base * o.backRatio) {
                det.base = det.base * 0.9 + s * 0.1;
                if (pos != null && pos.redTop >= 0 && pos.greenTop >= 0) {
                    det.posValid = true;
                    if (pos.redRows > det.baseRows) det.baseRows = pos.redRows;
                }
            }
            return { action: "none", score: s, base: det.base, ratio: ratio };
        }
        if (det.latch) {
            if (s >= det.base * o.backRatio) det.latch = false;
            return { action: "none", score: s, base: det.base, ratio: ratio };
        }
        det.rawRing.push(rawScore);
        while (det.rawRing.length > o.fastFrames + 1) det.rawRing.shift();
        var lowCount = 0, ri;
        for (ri = 0; ri < det.rawRing.length; ri++) if (det.base > 0 && det.rawRing[ri] < det.base * o.fastRatio) lowCount++;
        var isFast = (det.rawRing.length >= o.fastFrames && lowCount >= o.fastFrames);
        var isDrop = (!posUsable) && (s < det.base * o.dropRatio);
        det.fastPending = (lowCount > 0);
        if (topGone || isFast || isDrop) {
            if (det.markKind !== "gone") { det.markKind = "gone"; det.markMs = now; det.fastMode = isFast; det.topMode = topGone; }
            var need = det.topMode ? o.topGoneMs : (det.fastMode ? o.fastMs : o.dropMs);
            if (now - det.markMs >= need) {
                det.rawRing = []; det.fastPending = false; det.fastMode = false;
                det.markKind = ""; det.markMs = 0; det.latch = true;
                return { action: "bite", score: s, base: det.base, ratio: ratio, fast: det.fastMode, top: det.topMode };
            }
        } else {
            det.markKind = ""; det.markMs = 0;
            if (s >= det.base * o.backRatio) {
                det.base = det.base * 0.9 + s * 0.1;
                if (pos != null && pos.redTop >= 0 && pos.greenTop >= 0) {
                    det.posValid = true;
                    if (pos.redRows > det.baseRows) det.baseRows = pos.redRows;
                }
            }
        }
    } else {
        if (det.backLatch) {
            if (s < det.base * o.dropRatio) det.backLatch = false;
            return { action: "none", score: s, base: det.base, ratio: ratio };
        }
        if (s >= det.base * o.backRatio) {
            if (det.markKind !== "back") { det.markKind = "back"; det.markMs = now; }
            else if (now - det.markMs >= o.backMs) {
                det.markKind = ""; det.markMs = 0; det.backLatch = true;
                return { action: "line_back", score: s, base: det.base, ratio: ratio };
            }
        } else { det.markKind = ""; det.markMs = 0; }
    }
    return { action: "none", score: s, base: det.base, ratio: ratio };
}

var detectOpts = getDetectOpts(storage.get("sensLevel", "mid"));

var pixStore = { buf: null, len: 0, hist: null };

function grabLineStats(screen, region, mask) {
    var bmp = screen.getBitmap(); if (bmp == null) return null;
    var bw = bmp.getWidth(), bh = bmp.getHeight();
    var rx = Math.max(0, Math.min(region[0] | 0, bw - 1));
    var ry = Math.max(0, Math.min(region[1] | 0, bh - 1));
    var rw = Math.max(1, Math.min(region[2] | 0, bw - rx));
    var rh = Math.max(1, Math.min(region[3] | 0, bh - ry));
    var n = rw * rh;
    if (pixStore.buf == null || pixStore.len < n) {
        pixStore.buf = java.lang.reflect.Array.newInstance(java.lang.Integer.TYPE, n);
        pixStore.len = n;
    }
    bmp.getPixels(pixStore.buf, 0, rw, rx, ry, rw, rh);
    return analyzeRedRegion(pixStore.buf, rw, rh, detectOpts, pixStore, mask);
}

function computeScale(srcKey) {
    try {
        var raw = storage.get(srcKey);
        if (raw == null) return null;
        var a = JSON.parse(raw), iw = a[0], ih = a[1];
        if (!(iw > 0 && ih > 0)) return null;
        var dm = context.getResources().getDisplayMetrics();
        var sw = dm.widthPixels, sh = dm.heightPixels;
        if (iw === sw && ih === sh) return null;
        if ((iw > ih) !== (sw > sh)) return null;
        var kx = sw / iw, ky = sh / ih;
        if (Math.abs(kx - ky) / kx > 0.02) return null;
        return { kx: kx, ky: ky };
    } catch (e) {}
    return null;
}

function scaleNoteOf(srcKey) {
    var sc = computeScale(srcKey);
    return sc ? ("按原图等比映射 x" + sc.kx.toFixed(3)) : "按原始像素（未缩放）";
}

function mapRegionToScreen(region, srcKey) {
    var sc = computeScale(srcKey);
    if (sc) region = [Math.round(region[0] * sc.kx), Math.round(region[1] * sc.ky), Math.round(region[2] * sc.kx), Math.round(region[3] * sc.ky)];
    var dm = context.getResources().getDisplayMetrics();
    var sw = dm.widthPixels, sh = dm.heightPixels;
    var x = Math.max(0, Math.min(region[0], sw - 8));
    var y = Math.max(0, Math.min(region[1], sh - 8));
    var w = Math.max(8, Math.min(region[2], sw - x));
    var h = Math.max(8, Math.min(region[3], sh - y));
    return [x, y, w, h];
}

function mapPointToScreen(x, y, srcKey) {
    var sc = computeScale(srcKey);
    if (!sc) return [x, y];
    return [Math.round(x * sc.kx), Math.round(y * sc.ky)];
}

function doClickKey(x, y, srcKey) {
    var pt = mapPointToScreen(x, y, srcKey);
    doClick(pt[0], pt[1]);
}

function rectOverlapRatio(fr, region) {
    if (!fr) return 0;
    var x1 = Math.max(fr[0], region[0]), y1 = Math.max(fr[1], region[1]);
    var x2 = Math.min(fr[0] + fr[2], region[0] + region[2]), y2 = Math.min(fr[1] + fr[3], region[1] + region[3]);
    if (x2 <= x1 || y2 <= y1) return 0;
    return ((x2 - x1) * (y2 - y1)) / Math.max(1, region[2] * region[3]);
}

function localMask(fr, region) {
    if (!fr) return null;
    var x0 = Math.max(0, fr[0] - region[0]), y0 = Math.max(0, fr[1] - region[1]);
    var x1 = Math.min(region[2] - 1, fr[0] + fr[2] - region[0] - 1);
    var y1 = Math.min(region[3] - 1, fr[1] + fr[3] - region[1] - 1);
    if (x1 < x0 || y1 < y0) return null;
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
}

function sleepAlive(ms) {
    var t = 0;
    while (t < ms && serviceAlive) {
        var d = Math.min(200, ms - t);
        sleep(d); t += d;
    }
    return serviceAlive;
}

function startSystem() {
    var fx = storage.get("fishX"), fy = storage.get("fishY"), mx = storage.get("magX"), my = storage.get("magY"), rawReg = storage.get("lineRegion");
    if (fx == null || mx == null || rawReg == null) { toast("请先完成前面的配置"); return; }
    if (!checkPermissions()) return;
    if (!ensureScreenCapture()) { toast("屏幕截取权限获取失败"); return; }

    var region = mapRegionToScreen(JSON.parse(rawReg), "lineRegionSrc");
    ui.run(function () {
        showPopup("悬浮窗 已开启");
        home();
        serviceAlive = true; isListening = false;
        launchFloatAndLoop(fx, fy, mx, my, region);
    });
}

function launchFloatAndLoop(fx, fy, mx, my, region) {
    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    var expanded = false;
    var activeTab = "status";
    var spinTimer = null;

    var floatWin = floaty.window(
        <frame id="floatRoot" w="wrap_content" h="wrap_content">
            <frame id="bodyCard" w="wrap_content" h="wrap_content" visibility="gone">
                <horizontal w="wrap_content" h="wrap_content">
                        <frame id="railBox" w="60dp" h="*">
                            <frame id="tabIndicator" w="*" h="34dp" layout_gravity="top|left" marginTop="83" marginLeft="6" marginRight="6" />
                            <vertical w="*" h="*">
                                <text id="railTitle" text="AutoFish" textSize="10sp" textStyle="bold" gravity="center" w="*" h="44dp" marginTop="30dp" />
                                <frame id="btnMain" w="*" h="52dp" clickable="true" marginBottom="6">
                                    <text id="txtMain" text="开关" textSize="12sp" textStyle="bold" gravity="center" w="*" h="*" />
                                </frame>
                                <frame id="btnClose" w="*" h="52dp" clickable="true" marginBottom="6">
                                    <text id="txtClose" text="参数" textSize="12sp" gravity="center" w="*" h="*" />
                                </frame>
                                <frame id="btnSettings" w="*" h="52dp" clickable="true">
                                    <text id="txtSettings" text="设置" textSize="12sp" gravity="center" w="*" h="*" />
                                </frame>
                            </vertical>
                        </frame>
                        <vertical id="contentBox" w="206dp" h="*" padding="12 42 12 12">
                            <text id="contentTitle" text="检测状态" textSize="14sp" textStyle="bold" w="*" h="wrap_content" marginBottom="10" />
                            <vertical id="tabStatus" w="*" h="*">
                                <text id="statusText" text="识别红线中" textSize="18sp" textStyle="bold" w="*" h="wrap_content" marginBottom="4" />
                                <text id="statusSub" text="-" textSize="11sp" w="*" h="wrap_content" />
                                <frame id="btnToggle" w="*" h="46dp" marginTop="12" clickable="true">
                                    <text id="txtToggle" text="开启检测" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                                </frame>
                            </vertical>
                                                        <vertical id="tabClose" w="*" h="*" visibility="gone">
                                <text id="delayLabel" text="收杆后抛杆延迟（毫秒）" textSize="11sp" w="*" h="wrap_content" marginBottom="4" />
                                <frame id="delaySeekWrap" w="*" h="wrap_content" marginBottom="2">
                                    <seekbar id="delaySeek" w="*" h="wrap_content" progress="10000" max="20000" />
                                    <frame id="delayDot" w="7dp" h="7dp" layout_gravity="center" />
                                </frame>
                                <text id="delayValue" text="10000 毫秒" textSize="11sp" gravity="right" w="*" h="wrap_content" marginBottom="10" />
                                <text id="sensLabel" text="识别灵敏度" textSize="11sp" w="*" h="wrap_content" marginBottom="4" />
                                <horizontal id="modeRow" w="*" h="34dp">
                                    <frame id="segLow" layout_weight="1" h="*" clickable="true" marginRight="4">
                                        <text id="txtSegLow" text="低" textSize="12sp" gravity="center" w="*" h="*" />
                                    </frame>
                                    <frame id="segMid" layout_weight="1" h="*" clickable="true" marginRight="4">
                                        <text id="txtSegMid" text="中" textSize="12sp" gravity="center" w="*" h="*" />
                                    </frame>
                                    <frame id="segHigh" layout_weight="1" h="*" clickable="true">
                                        <text id="txtSegHigh" text="高" textSize="12sp" gravity="center" w="*" h="*" />
                                    </frame>
                                </horizontal>
                            </vertical>
                            <vertical id="tabSettings" w="*" h="*" visibility="gone">
                                <text id="themeLabel" text="主题颜色" textSize="11sp" w="*" h="wrap_content" marginBottom="4" />
                                <horizontal id="themeRow" w="*" h="34dp" marginBottom="8">
                                    <frame id="segLight" layout_weight="1" h="*" clickable="true" marginRight="4">
                                        <text id="txtSegLight" text="浅色" textSize="12sp" gravity="center" w="*" h="*" />
                                    </frame>
                                    <frame id="segDark" layout_weight="1" h="*" clickable="true" marginRight="4">
                                        <text id="txtSegDark" text="深色" textSize="12sp" gravity="center" w="*" h="*" />
                                    </frame>
                                    <frame id="segSystem" layout_weight="1" h="*" clickable="true">
                                        <text id="txtSegSystem" text="系统" textSize="12sp" gravity="center" w="*" h="*" />
                                    </frame>
                                </horizontal>
                                <horizontal w="*" h="36dp" marginBottom="8" gravity="center_vertical">
                                    <text id="popupSwitchLabel" text="弹窗开关" textSize="11sp" layout_weight="1" h="wrap_content" />
                                    <frame id="popupSwitch" w="52dp" h="32dp" clickable="true">
                                        <frame id="popupSwitchTrack" w="52dp" h="32dp" />
                                        <frame id="popupSwitchThumb" w="24dp" h="24dp" layout_gravity="center_vertical|left" marginLeft="4" />
                                    </frame>
                                </horizontal>
                            </vertical>
                        </vertical>
                </horizontal>
                <frame id="topBar" w="266dp" h="30dp" layout_gravity="top|left" marginTop="6">
                    <text id="dragDots" text="···" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                    <horizontal id="topBtns" layout_gravity="right" gravity="center_vertical" h="*" w="wrap_content" marginRight="8">
                        <frame id="btnMin" w="26dp" h="26dp" clickable="true" marginRight="4">
                            <text id="txtMin" text="—" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                        </frame>
                        <frame id="btnCloseFloat" w="26dp" h="26dp" clickable="true">
                            <text id="txtCloseFloat" text="×" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
                        </frame>
                    </horizontal>
                </frame>
            </frame>
            <frame id="anchor" w="52dp" h="52dp" layout_gravity="top|left">
                <img id="anchorImg" w="40dp" h="40dp" scaleType="fitCenter" layout_gravity="center" visibility="gone" />
                <text id="anchorText" text=":D" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
            </frame>
        </frame>
    );

    floatWinGlobal = floatWin;
    floatSpinStop = stopSpin;

    ui.run(function () {
        try {
            var lt = new LayoutTransition();
            lt.disableTransitionType(LayoutTransition.APPEARING);
            lt.disableTransitionType(LayoutTransition.DISAPPEARING);
            lt.disableTransitionType(LayoutTransition.CHANGE_APPEARING);
            lt.disableTransitionType(LayoutTransition.CHANGE_DISAPPEARING);
            lt.enableTransitionType(LayoutTransition.CHANGING);
            lt.setDuration(LayoutTransition.CHANGING, 200);
            lt.setInterpolator(LayoutTransition.CHANGING, new DecelerateInterpolator());
            floatWin.floatRoot.setLayoutTransition(lt);
        } catch (e) {}
    });

    function col(k) { return (k && k.indexOf("#") === 0) ? k : (function () { var c = isDarkMode() ? THEME.dark : THEME.light; return c[k] || c.primary; })(); }
    function segBg(k, radiusDp) {
        var g = new GradientDrawable();
        g.setShape(GradientDrawable.RECTANGLE);
        g.setCornerRadius(radiusDp * density);
        g.setColor(Color.parseColor(col(k)));
        return g;
    }

    function segSet(btns, txts, values, current) {
        var c = isDarkMode() ? THEME.dark : THEME.light;
        ui.run(function () {
            for (var i = 0; i < values.length; i++) {
                var on = (values[i] === current);
                try {
                    btns[i].setBackground(on ? segBg("primaryContainer", 10) : segBg("surfaceContainerHigh", 10));
                    txts[i].setTextColor(Color.parseColor(on ? c.onPrimaryContainer : c.onSurfaceVariant));
                    txts[i].setTypeface(null, on ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
                } catch (e) {}
            }
        });
    }

    function applyTabs() {
        var c = isDarkMode() ? THEME.dark : THEME.light;
        var idx = (activeTab === "status") ? 0 : (activeTab === "about" ? 1 : 2);
        ui.run(function () {
            try {
                floatWin.tabIndicator.animate().translationY(idx * 58 * density).setDuration(220).setInterpolator(new DecelerateInterpolator(1.5)).start();
                floatWin.txtMain.setTextColor(Color.parseColor(idx === 0 ? c.onSecondaryContainer : c.onSurfaceVariant));
                floatWin.txtClose.setTextColor(Color.parseColor(idx === 1 ? c.onSecondaryContainer : c.onSurfaceVariant));
                floatWin.txtSettings.setTextColor(Color.parseColor(idx === 2 ? c.onSecondaryContainer : c.onSurfaceVariant));
                floatWin.txtMain.setTypeface(null, idx === 0 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
                floatWin.txtClose.setTypeface(null, idx === 1 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
                floatWin.txtSettings.setTypeface(null, idx === 2 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
                floatWin.contentTitle.setText(activeTab === "about" ? "参数" : (activeTab === "settings" ? "设置" : "检测状态"));
                floatWin.tabStatus.setVisibility(activeTab === "status" ? View.VISIBLE : View.GONE);
                floatWin.tabClose.setVisibility(activeTab === "about" ? View.VISIBLE : View.GONE);
                floatWin.tabSettings.setVisibility(activeTab === "settings" ? View.VISIBLE : View.GONE);
            } catch (e) {}
        });
    }

    function applyToggle() {
        var c = isDarkMode() ? THEME.dark : THEME.light;
        ui.run(function () {
            try {
                floatWin.btnToggle.setBackground(segBg(isListening ? "error" : "primary", 12));
                floatWin.txtToggle.setTextColor(Color.parseColor(isListening ? c.onError : c.onPrimary));
                floatWin.txtToggle.setText(isListening ? "关闭检测" : "开启检测");
            } catch (e) {}
        });
    }

    function applyFloatPopupSwitch(isOn, animate) {
        var c = isDarkMode() ? THEME.dark : THEME.light;
        var targetX = isOn ? (20 * density) : 0;
        ui.run(function () {
            try {
                if (animate) {
                    floatWin.popupSwitchThumb.animate().translationX(targetX).setDuration(200).setInterpolator(new DecelerateInterpolator()).start();
                } else {
                    floatWin.popupSwitchThumb.setTranslationX(targetX);
                }
                floatWin.popupSwitchTrack.setBackground(segBg(isOn ? c.primary : c.surfaceVariant, 16));
                floatWin.popupSwitchThumb.setBackground(segBg(isOn ? c.onPrimary : c.onSurfaceVariant, 12));
            } catch (e) {}
        });
    }

    function applyFloatTheme() {
        var c = isDarkMode() ? THEME.dark : THEME.light;
        ui.run(function () {
            try {
                floatWin.bodyCard.setBackground(segBg("surface", 24));
                var railBg = new GradientDrawable();
                railBg.setShape(GradientDrawable.RECTANGLE);
                railBg.setCornerRadii([24 * density, 24 * density, 0, 0, 0, 0, 24 * density, 24 * density]);
                railBg.setColor(Color.parseColor(c.surfaceContainerHigh));
                floatWin.railBox.setBackground(railBg);
                floatWin.tabIndicator.setBackground(segBg("secondaryContainer", 12));
                floatWin.railTitle.setTextColor(Color.parseColor(c.onBg));
                floatWin.dragDots.setTextColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.dragDots.setAlpha(0.55);
                floatWin.anchor.setBackground(segBg(c.primaryContainer, 24));
                floatWin.anchorText.setTextColor(Color.parseColor(c.onPrimaryContainer));
                floatWin.contentTitle.setTextColor(Color.parseColor(c.onBg));
                floatWin.statusText.setTextColor(Color.parseColor(c.onBg));
                floatWin.statusSub.setTextColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.txtMain.setTextColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.txtClose.setTextColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.txtSettings.setTextColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.delaySeek.setProgressTintList(ColorStateList.valueOf(Color.parseColor(c.primary)));
                floatWin.delaySeek.setThumbTintList(ColorStateList.valueOf(Color.parseColor(c.primary)));
                floatWin.delaySeek.setProgressBackgroundTintList(ColorStateList.valueOf(Color.parseColor(c.surfaceVariant)));
                floatWin.delayValue.setTextColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.delayLabel.setTextColor(Color.parseColor(c.onBg));
                floatWin.sensLabel.setTextColor(Color.parseColor(c.onBg));
                floatWin.themeLabel.setTextColor(Color.parseColor(c.onBg));
                floatWin.popupSwitchLabel.setTextColor(Color.parseColor(c.onBg));
                var dot = new GradientDrawable();
                dot.setShape(GradientDrawable.OVAL);
                dot.setColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.delayDot.setBackground(dot);
                floatWin.delayDot.setAlpha(0.6);
                floatWin.btnMin.setBackground(segBg("surfaceContainerHigh", 13));
                floatWin.txtMin.setTextColor(Color.parseColor(c.onSurfaceVariant));
                floatWin.btnCloseFloat.setBackground(segBg("error", 13));
                floatWin.txtCloseFloat.setTextColor(Color.parseColor(c.onError));
            } catch (e) {}
        });
        applyTabs();
        applyToggle();
        segSet([floatWin.segLow, floatWin.segMid, floatWin.segHigh],
               [floatWin.txtSegLow, floatWin.txtSegMid, floatWin.txtSegHigh],
               ["low", "mid", "high"], storage.get("sensLevel", "mid"));
        segSet([floatWin.segLight, floatWin.segDark, floatWin.segSystem],
               [floatWin.txtSegLight, floatWin.txtSegDark, floatWin.txtSegSystem],
               ["light", "dark", "system"], storage.get("uiTheme", "system"));
        applyFloatPopupSwitch(popupEnabled, false);
    }

    var ICON_B64 = "iVBORw0KGgoAAAANSUhEUgAAANYAAAEACAYAAADP84ioAACAAElEQVR42uz9ebxt2VXfh35ns5rdnP72XfUqlUoSEqIRAtEZYwQGDIkTIMZ5tgOPEL88t4Ad29gYEgix85yYNLZfcHiYYAfR2DKYXkJCqC2pJFVJ1d-6dZtzT7_71c053x9zrrXXOffcqluS6jaihj5b99Q5e6-99tpzrDnGb_zGbwhetVtm999_P__2p_8cu-sTlu87iYgEWkckccS5L_sS_pcf_6e9k2trD0ZSf7Gy9i7pqp6KpIyTmDiK6S4u0FnoEXVS4iQiUgIlBAAOgTUGUxVUVUVpKptn-cyW9iJCfKw05jO_8XvvGf7IT_0Ty6XHubKxxXg0JZtWTPOcp596hCOrJ_jX7_s_-dmf3bnVl-qOM3GrT-CPm33k__4R3GyTYuEc_X6fhV6PhX6PleUF1Nlv57Hf_596UaTuc8a91ZT2q11lvrTM8tM2z1NhjRBKopXGOnBKsHriKAurK2itkIDAIQAH4Bw4i3MOh8NY65yjwLEuHJ90zj1RGrtZlOZKVhSfzmbZ03_lL__vw9_87f_BbWztMplmTKcZ_-EX_jFf_e3fz5f_mR--1ZfvjrFXHesm2G_9m3_An_yzf4_ff-ePc2J5ieWlPkfWVonu-XaefM8_7S0u9O-NIv16qcRrpOCNDvcmLGdtaaLJYMR4OMQUJcJBVVUURYmTgqUjKxw9dYK030MggmPNrSgyBoMBaZrS6aQopUFInCM4n8M5nHMU1toNa90nq8o9WhTVE3lZPpbl5ZMPfs2fHu5--r0MhiO29ka8-6MbfPUbl_myP_3DCPHq8rmevXplXiH79GOvZ3LhL_Lc5Qs8fO9drCwucuKL38jHfv09vdWV_n1pmr5Oa_0aHak3KiXfLCSnwKU4h3BgS8toZ4_h7gBbGUxVMZlOMM6yunaEIyePky72kEoihEQiEK0v1AGz2YQXXngBay1KKfq9HouLy3S6XYSU4VkCmvDR4RxY6wpj3Ya17hFjzHvKqnz_cDT59Gu-6gcG24_9InuDIbuDXX7o376TH_2mb-Jrvv0f8qqP7bdXL8fn2Z5470_zmq_6G3zid_97VpZXWVtZ5LHHn06OH1l9MIqTr4y1_too0l-ilDollEwRAoTfNpyz4EAYy3QwZrC9S5llzGYzKmtYWFrkyPGjdBcWEFrhBN6phPSvg327iHMW5yxVVTEej5lMJmRZRhwnHDt2nE6nA1JgD64CB8658KMzzrqrVWU_WlX23Vlevn84HH36oa_9wcHFj_4cV65u8qknnuL08ZM8s_0kP_hf_8Kt_gpuC3vVsT4P9vGPv53Bp76RRz7-DF__DQ9z7NgqJx5-gOc-_unFThp9SaTVf6yV-kYp5DklVCSlRAiBg_miduCswZmKfDxltL3LZDhiMpnQWehx7MQJ-kuLoJXfZADqAFDM_0u0dh-ah3c4ay1ZlrGxsYnWEafPnEYqda1jMXesxlGdw1iMsfaqrcxHs6x493A8-8NLVzY_9bYvf8PkE598ikc_9TT33XOK3_jtT_DT_-KXbvXXckvtVcf6HOwXfvAvcfKb1njXe36R7_mGH-Suu07x-CeeSe66--SDvX7nbSpS3yCF-CopxHEpFISQza93Dyi48A0IB9YY8snEh4A7OxRFzpGTJ1g9ehQdR7jgjLX50E82P4NAiLk7CeH2Pb825_wjiiIQwp_Di64EFxxVYOuDG2uKyl6ZZtm7x5PZv16_vPUHX_blbxx-8lNP8PGPP8rdd91Ftfo43_zNv3Krv6ZbYq861mdhf-uvfh3f-jVv5yf_zo_xD_7xP-LcmTN88vFPds-cPPXlC73uf5Im8TdqLc-Ci5rMR4Sfwkr3-Yx_1HtMnuXsbe-wc3UDKeDk2TP0FheQWodn7M-hOLBLzU34jCukTy68N81OJBFh12y9JLzucHPhOa51Eg6HdY6yNDuTafE7o_H056-sb_zBV3zZGwePP_40x4-t8fhTz_Mnv-tHb_VXdtPtVcd6mfZLP_ejPHh6meFkxr13n-XpZy50Tx4_8uXdbvLn0iT65jjSJyQC4fbvFbUDybDr1E7lF7pDOEeW5Qz39qiKgpWVFeJu6h3ygOMI8LtM2GqavzYhYetn0XJqIYJjCJwQzQ5XH-GlUD4nODRsBKiMoyiq3TzPf3synf2LFy6s_8H995_Ln37-EkdWlvjARzf4_r_5D2_113fT7FXHukH7e3_rL_I973gzTz11gTe84UH-4I8-qt_6pW_8soVe9y-kUfytWqvjUoaFaue5jWs5WB1xNcBA41j-Z2sN1hpUC6lDHnSq9p4VjugOOEX9c_2POOg4Ait9CCnDv_h9rHWI_e_rgmO5w4COAztwVVbreVb87HiS_W_3Pfzghec-8yzHjizzmWfX-ZJv_MFb_VXeFHvVsW7AHvn1_5XTpxJG04JTJ45yeX3rWJomf6GTxj8QRfpuhUTUvuAIRVm77xhNyNdytIOOBb6YWyN8zjnaOPbhX9Y8QTostPM-en3Hav9NCOFDVbH_3eqfrOTQnO3g2TgHlTFVWdr3lJX9H3f2xr-zstLLn33uKstLPX7-1z_Af_dTP3urv9ZX1F51rBexn_wH38e3fv2b-MxzL_C2Nz7MCxcv67vOnnxblER_VSv5DillIl29MMOLArp3cMdqULYDu1Xze9q7XAA3DoSTHEDqmjxLyOs4l7jurmWbHGv-_PbuNT9EC74X13esfc-z8_uHdfZqUZqfnczy__Xc3UcvPPn485w5fYSPffRJvurP_je3-it-xUzd6hO4Xe0Pf-VH-bq3fhFFnvNlb3iQwXh27NjR5f8qTfRPaC3fKgW6Xs4i3OEbRwg0Ig5xLA6GgZ57NIfqmpVbO1zjacwPUb_WBQesX2pDULY_XGxC0LYjNTnWfic96Diu9UvH4Y4l3P47tGzto0LQV4K3aiXePNgdbe_sDi8IpHnuhRf4K9_3bag9zUefevpWf92fd3vVsQ5Yt9vlD3757_P-j3-Sh-67h0vrV3W31_uqfjf9iSRW36eVXJNCBsAh1Ivq1Wf9Cm8WmXNzEKMJBVv-49qOxrz65DzaBvWu1Vq2YYd04e2s0yATnEpxMsGhsBacddcAKLSPVIMf4tq_zV2tDkvdPue6xpzfiduoZ80Ekb4gILXkHqXkn-h2OivD0fTJr_yarxpceO4i3_7tX8bb3vQA_-bfv_9Wf_WfV3s1FGzZr_yf_zUPnrmHvdGIN7_uQS5c3Tq2srT4l9I4-oFIy3NCuHkdx7V2FMJuETBp4Q7Ln1zg6LmwXgM5trWROeuP76QGoRsH9K-pEM4SXBonFE53iHsrxN0VpEr9M01JlQ_JRxuIcoSSFiHbyKCcQ-dCIqRqwtDD0Mf6X_-e4vqhoHNN5CmEPAS4t1gsxmJmefWewXj2jx__9PnfOXtyJX_TO_4Gv_5zP8S3_Oc_fauXwOfNXt2xgv3GP_-rfP3bv4Tt7QGfefaCXl1Z_KrV5cX_Nk3i_yJSak0K0Qq_5q8TB0K85ucDeZJnmId_LTgnwII14KzEoUF1iXpH6aycJlk6RbxwgmThKElvBRX1cTJFxD2i7irp0kk6S6eI-seQ0QKoDk4mSN0hSvtEUYwtpjgzCxiGCA7knZI6YBQCIcLdQsz_uRYTDOe87zfhGrRY9SKEgs32XD87gChSCqmVvCeO9J_o99L-5fXNx8rtxyY_8mM_w8_8-A_yC__2D2_1Uvi82Ks7FvAf_tWP8Ke-54d56r0_x5X1jaWzp09-3-rS0l9Ok-guIcOycWDtHOnbh_DVQIT_j3kUdQCA8McQoDogY0AilUaqBBGlRGkPFfdARth6lYcQURIQAVEjhQqLxLUCt6aK5RySnHznGfLBBZSsAQ4HIkZ3FqjKGdgKIWVggNiACop9sDvN0cG2-POujTY6_PnhAsWqBlnmRei6YO0AG0LdoqiKveH4X61v7vzdMyePXvprP_xT_KU__x1801-483euP_aO9ZF3_l3e8p0_xuUP_XOubu-tHT-68rf7vc4PJFp3az5fc9918ztwfUO29S7WCvmw-59f_2udwKkuvdV7_C4jQAgf9lGHaNS-sT_oOqx4e10wARCU5HvnybafRgqLDHuKJaG7do6qGFHNdpABgrFUCISvoSE5zLwjO6TwR2sHw_7o-1HLa2H-UKQWdflBUlaVGU5m_9fG1uBvnTy-cvEnfvqf8R1_-mv5-u_572710vicTH4ejnHH2od_9ad4y3f-GFc--n8wnE7XTh9f-9Glfve_SqKo20bLfPHWtiDyGpCbQ-bO-tqVD_NcYJa7fQ_jQMQLyHQJpzs41cHKFCN02KH2w-Ptx2H2YhQ_v4tocNKfPzYAHgLrIlS85N-zqZtJhBPzXbf-1zmcFTihUckiVnSpKjCVwXmUxIfDh9TnrvfAeuBHOEespVrqp9998ujiT25ubp75O3_9L_G-DzzCB3_pH3D2Vi-Qz8H-2OZYH37XP-JLvvUvs_Wxn2c8nq4dWV780W4n_f5IqaS9kK21h-xYdRhoW3C3w4Sf64V2kLpkhSLuH0d1Vpuwas75cyHXuX4QcTCv4UV3LIcrxlTTHRA25FIagUQlC-goJZ8NkK7yztuczX539Qx8g0OTLp4h7hzFotA6QTiLM4V_r5pUfA1ocy2Q07TIhLOXAqmUfDiKohM7u4MPvf1tXzL8zd__I37oh_8cv_vB32V391avlpdvfywd65Ff-Wne8m3_BduP_BKTaba2vNT_0SSJvl8plRx8rm1B4ewDIULOhMBagXUaGXXBGbBl41Tt1wjVpbN4ChH1AjI3Ly63e6kOqyXdyO9qa45SjCkn2whhgvOEr1t3ibqLlNkYbBEQQ8c8G5pT7r2vOxwKFa0Q9Y4SdVaIO8sIAVU2BMycAd8uN1DjFodRpcS8nODTRqmkejiOohPD4exDX_yG1w1_471_xA9-15_lDz_xbra3b_WqeXn2xy4U_Mg7_yFv_jN_g61HfpnxZLa2tND70STW3y-FSK4N3eYkWRpHEcGpBMZpKqupRI9o4RSdpVMIocJisbVbhkWkkFEPpdMAbfvMZo7IuRq039dJdWjB9rpWs_Y83OHaS7rFqq-q3DPeddSC8-cZk5vfNfyRnEA4Q1VMsdZiiXGig0qWkbrXKnLbVqEulB-sDb9ukAuwrmnCdM5iQ9gsJSpNou9aXuz95GA0PfNdf-pP8O_e90H-p7_9N2_1snnZ9sfKsT74az_JW77z77D1yL9kPJ6tLS32_n4U6e8XQibiQGvF9R8WYcG5lKh3kmT5bnpH7qWzdBJTlZgyb9jqbTdwKHTcAxVx4J5OzVF31_Ga9lHEoS43320Of21NZLQgDM7kYC1CROFmYRoe0jXn4ISH2Z2jKjOcqebnrRNU1PegTGsbd_gOTmfxuac14d92_mmvyUXx7H-VRuq7lvvJT25s7Zz5q9_17fzD_-3_4Df-5V-71cvnZdkfm1Dw_T_3o7z1P_lPuPLhX2YymR1ZWur__TiOvk9IkcgWg_yavEDQCnFEcCqFTNdIls8g0xWUSrHljGxwEarJvLAa4GtfXE1IF06gksVAnghZjbWURY6UoagqroW66-ZIj6PVjAaLwEJA_IRttYHULI5iRDndCg7VEJuwThN3lnGmxBRDpHQhxxOHQiLCV5MxThGlS0idNlQuZwrKbA8wzam7UPMSQoFUHuRoPnNNNm7X_lzzPmF_l1qphyOlj1_Z2Pngn__2bxl98bf-CF_6mpRf-OXfvdVL6YZM3-oTuBn2yP_1j7jnzUs8_4HfZjwuVo-tLf29JNHfJ6RIXCtYO-hUIuhGeGhdhAUhsSSkvVWE7uCsQNicYrKJK8ZBf8JhhW1yHVff3eMuSLmP-rO7u83O9jZ33XsfSqrm93MLrAhECO4MtpySTwdU5QylI6Kkh1RdpO7glKqrSdhA4hMtCN2hwFmsKRFKeTZFkwddHzgRgLMFppoQsQhInFDhM8W4qsDV8U_YkeLeCjpdZLZ7BWELkHaer-5DX0K-1WLVC4HqpNF3HzuyNLu6s_fDk9_5n3YfPL5AWc6Ios6tXlIvaX8sHCs9brh6acBoMumdPnnibyax-n4pSNw88QjcvP1ABe0aVSjWWqvQ3WV0soSzfrG7coqZ7YItww3fMgeu_d1exz1klGBFq3_KGna2rhLHiZcmAxB1q3393g7nDMKW2HJGMR2QTzYx-QhnK78riBgZdYm6q3SWjiF0H2QLNEH4BksBKsDvpsxRkQxsPne4ytIcsgw_GqpigqNCkHj31QlSp5hy3ORkNX2rMpIkPUrUK6jG62BtQ61yjUO12lSczzvrTFFIVJomf-7I8vKnf-8PP_1P3vjQOfvJ3_znt3o53ZB9wedYH_zVv894kvPg1_81Thxb-487afQDWqnEr3c3h4r3sc29NWlS83sJukPcXwUZhZ2nopztYsspQljPAYT2agShiToLoGKfy9gKbEGZj6myKatry4hwLsIZMBkm26McrzPbvcBk82lG659mvP4Y2c7TuHwHTUmkLIqC6d4VssEV8r3nGV19imq8gTAFzplaE9cvVCEQEoSwmDLzzAipODQCpR0VenBF4F_nTBVuNAIhImTU9TeM5kXema0pQEii7hpWxAdyK4exDoumrASmyb_qWpvA-PtMJ0miH_yat73uy-8-e4TN3QEf-OX__lYvq5e0L-gc673_1_fyFf_x3yEeXWT7_B8-1OumPxVF-h4xR5P3scz3F0dpuAUeDJQ4IlRnjbh_FCci75TliGxwGWemgN0X4TQ_6x6dpZMIIcj3rjDdvUQ52WK8dZHpYJOjR1fA5Zhsh2K8wWzvCvngMuV4AzPbxuYDMBMEJQKDkKLJcayp2NnepNvtECcRmIxiNsS5DGEmmHLqd4m6_0rU1CKNilJMOUEJ47O35u_7tQb3510RUWcFKaPQhgLW5Jh8z9fEmv-BQKE7q6g4pchGPv90tpGmcU6he0cRSZ-yyAJDPsAzwuGcBJWA1KtSuBPjUfGHZ06sDn7mF36Jv_dXvptf-NX33eoldl37gg4Fjx77Up5-zy8wzbKFk0dW_kqk1JsFB5Av57CuhqZt-NV-FoH_QWJlStJZ8WRYJ5CuIJtuY4tReK1rIO6G6OMkMu4jVUw2uEK2cwlsjnGW0dXLKOeYbj2Dk7JhsAu8Brv09AScqDlSAUYXNKijqQqsKX1YJx1CWGBGPrmIlipgFl48xiMvosmXcAVKKbBqLku9j2EsWru1Py9rS6wtPTdQSHAaHXcRMgaTN7JuCIezBbaYoJM-KulSZgKJwTpHNpuBSKAjWThyGiEi8tEVtKuQwjudQ5H2T4GQTLdf-KZOyk9s7Y1_6If-i--9fPZtf4LfS1O-_jYVqvmC3bE-9W9-jJmrePgb_wbV9uPflSbx35RSpvM6lEeurJVYF6PjDtYahDPXdu4isGhEvEy6eAJkjBAGV46ZDS4hzDiEWK6ljlTf6TXJwhrOWaa7l5FuhpIOZwr2tq-yuLRImsQoCUqCDA8h2qhkKAVIERRsvRSGkpLZbEJR5CytHkEoHc5DMBe6lQiJ5_fV21zDnLK-oO3a9FpxgNs3J9D63EmhkiVUFFNVOUpIJI4q28WZrFVeDg6pU-LOKg5HMd3FuRLhLIOdbYbDId2FFZLeUZL-KkhNWeYemkdiVZ_u8hniZIlyNpbOZq-TiqXLm9t_uH3-ySyKIh573qv93m72BZtjyTMnWV1d4en3_M93RVH0AwixhKtrKwJnBdYIjI2JekeQuhMKl9cey2c_EVG6hFCpX5iuophsMxtttcCKtmpSCImkwOZDpjsXEWYWWOCWPJtinaHbC3LPgS0upGrCNt9xHxa6kCEnkr6FXnpcvSgKdJygtEaGv3lRG38cqSRSKh8-hmNIKZDSYqsZzlX7WvsPchXbuhlCCJ8jVjm2GDDafI7ZYN3TJnTa6tyi-bnKxpiqIIr7CJXirL9WCwuLVEVOPtmlyMYI2aG7dJbu2j2o3jFk5yi95TPoqI_QHZL-GlJonUb6e4-uLP3F93zkMTmazPi7_-Xbb_VSO3z93eoTeCXsw7_x98kHe_ynf_WnRJqm36mkfEtd6HRO-SqQi0Atka6cIe4uUeTTcPf2tScxJ0N4WUydEneWcKhAus3ZvPQMOxuXw11eIoXyCzvIPvtwzmDyIcpOvIit9Is4n03ppClRHHtHkmK-6wmQSqFUhFYKpfxxQz-T_1l6NnxRFMRJilQaIRVSaqRUrYdsXuvPUfhzUxKtQItwAxDXEn8Pf1RghpSTq8hyk2J8kSLbQ0ah8N0ANp77YcsJVTZEqhid9v3u6xxpnBBLST7eo8qHOFuCiEm7J1k48hoWjz5AunDU18GEIuqtoJIFlFCdbhJ_3zd82Re9_t5TJ_lT_9l_x6c_ffuJgn5B5lir6j5EZ8rP__QP3aWU_m6QsWfo1PeRCJWukC6cQqc98vE6rpyFPOkAPBZCMR33kLrTwBPFbMxwe53lxS5SqqY4S82HCxw7GQrMXpXW75TOWWbTCQuLi0ipfX4lWjXc1nu3d8D62B69lFgDWVHSX0oD7C7auMP8XA6xmp_ohG-4nEzG4KDb789zq_b7hZ-VsJhsD-ssWhqcm1KMN0k6qUcYGyJyqFTbkny6Q9xfQyd9SqnBGoRUdLtdJpMB5XQPU2boJMEJCVIHtgcgjO8vi7vE_TVmxZgY-5qlXvqfPX3-4uN7e_9jtTMzt3rJXWNfcDvWe37zrzLINvknP_HzIlbJd0jd_aKot4aVCZVTOL1IsnSW7urdqHQZZy3VbIhw1YGu1_ZPAh13QepQajUMt64iTMHCwmJLUKZ9ZV1QVZHhoUJ4JzFlQZbndHo9UEGVVtbPE4c8QhgolA_bwn9baxFCEqepDw3l3Ll5kV0HUfdmSe9Y0heqtzavzjuBxf4bRdNbJQFyj1BKkLLClXuU022fV4q2joYHYKpsQBl2LYjCe0Pa61IVGflkjyqfA0DUlF5hWzICiri_iox7gBSxVt9515ljrz-2tsDX_tl38Mxv__atXnr77Atux1rdfjvdU9v84N_87rM6Sv_TtHcs7i0fYzoaYJ2hs7CCjhc8uuYsthxhyqEv9DYF4bmCUQ21qyjxC9s5bJWxtXGeTj9BRropetLG8RH7KEJ19iGcpax8-BanPX-Xl7KFyM0LqI360z4RmBqYcFjrkFIRxQlun2S028eUF-2bRLve1BRmLZ1OysxN2zXhw_UFhURY07DzPbBS4aqq9XQXmhn920lXko93SReWkCrG2ikIR5ymqEiRTQdk090AYHR9uE29CwXGiBAI3SHqLlHkY5Q098WR_u5nL-w9tr37e-VOXnE72RfcjjVQT3Hv295CFCV_UsedNya9I6B6dJdO0V89h0yW_Z3aOXAlxWwXW82a3qp5YcuGm6_0fUxSgsmw-YDR9gVmky0WFxdbIZyoNxe_qGX4jwBGUOc5wHgyJul2kFE0hwHDjiWk9juj8jw76t2sPoasAQxFVVlUFKOiJPxNhVZ_7RHC8ED6_MujhhqU3gdBCqmIoySgcd4bnBQhLGvtnA2oosJcLkLOJ5BKBDSTOfjSjBlyVPkAXImIo0aGTSpFp9NlNh5STIdeLqAuLbRo-a5GW6Um6iwjogQphYi0_s5TJ5cfXl1d4O3f8Tbct37rrV5-jX1B7VjP_PpPMouW-PjvvK-3urz6p-LuckenfZzUngwrfH5TC8CYckox20NQYd2ciLqfN-4apxqPt8nHW7xw_kkSaUjTJIRl8yEEbb0-d0AQWgowzjCZjFlZOwpK46SaNxrKoKku9p1AQ2-qd8XQYslk6rmCUkc46YEJ0eyObdYEzc7Z5uXVHEghQGmNMWa-zQTnqpV9Rc1AEUHTws1ZKzUrw9UsxQNqugKLsVOKbAelJaYRs3H0-30mk03K2ZAyGxOlS7iDsylrtSoh0WkflS5iJhlSmfviWH33My9sP7a195Fy_Xu_Gv7dv7vVyxC-0BxLH3k9vXKHqoru00nnLenCCkJFLe2gtmaFpcr3sOUY1chBW3DymvzEuZJseIWymCDKEaIcsXbiJEJ7vQpRU8pDzacZONA6t_oMSuOduNPrh92pBXML2SLNBpP7BTEbp7eOsrJ0Oz2UUp5SJOT8uYeq1tYyaHXv1FxfUOkIYxzOCQ_GSDF_cyfnPVa0BETrPjJn5xqFbh5l1sV4JwQag53uBWQzfBfWoqMI4SzVbIzJpzhbYUOuea1SlECohLi7zDTbRVRGKCm-4_iRxX-VxvoTb_im_ydwe_RufcGEgu_5lz_EaOtZPvgf_rWIlH6HjjvnVNLDV01kQ-z0tFOJsyXFbOi5eUBV5Az3drG2ju1Fc9sXrsKVI2JhyCZj4kjR6y8ipJ5D2VIGZE426kSHPYq8INIRnW7XQ-pSokI4RlN_mj-k0AgZzUNEqRuo3RhLmnSQMkJKPW_TkApEHUq2HzoAIAcfEqkiz91zhM-kmlqYECFsVCEfbELU-e48f74vG5Rlxmw2bkJDKcJ1tAVKelIwQqC0Jk0iiumIKptgq7ylonvAtZxn50fpIjLqgJRoJe9NEv3tv_juR-WH3vUzfPDH_9-3einCF5JjLRw7Trfb44u_5tvOah19R9Lpa6HiuWJs-8nCYcsptpw0NKa93W1Gw2G7bSGEZaJhPAgc4-GQXn_R32mbvErMd4OaiycJOYxf6CLUlYqiIO500HHSFHubhXfAqbyjqhaqWDuu8p28xhLFyYG_60b5ybfiB7SR_TcAKSKfOwoNQqGjFB3FVFU1P56c91SJVoFaSNF8Nk_ilc151Z9pOp2ys7Xlw8gQ5oqgYbjvZiMVvf4Cs_GAcjqgKrJARm5pNjatM-HriBJ04gEoJYWKI_WN3_aVDx9dXewhv_TcrV6K8IXiWM5CPhpwz1d-A5GWfzKK4jdGSa-lIk7D0PZzpSpPrzEZALYqmYyH9Pt9pFItpsPcWYQUlEVGURb0F5f2kVpd2wlreF0qf4dXElHzlYSgKEuSTg-hYhASK6QHCVq7R5MLiTlbwjUaghJQPmTTKtR-5lKZbTi-2T3r39d0rjpcbZUCpI5QOqKqqnA-4XXIhgUvhJofK-xiQh0AaIKzRTrCmqpBKOubkGzv5mE37HS7WFtRzEZU2dQPlailDZzdlxv6PE-RdBeRKgIckRIP9dLoDcsLXZ5_9DM8_PDDt3pJfmE41u_-_36CTtLnkV_9ub5S6ltklHZU7GHb9g5EQJdclVPlA6Q1CBz5bIKzht7CQlgcukngm0UAjEZDlNIknQ5zCCygZwHFc_VCq2WWg-M4BMY6KmOJ057XEpS1puBcW1AKhazDs1D7mjuamh_Px2weWWwt9BbZsHGa5hFCuLlDtXcaH04WlTlQe5s72Px4MmgL1kjmPNx0QvmdRGsqU3r-ZaixeYSRa2pqOk7oLyxQ5lOK2QhsgXAFs8E25WQI1vlWktbepeIeMoT6Uog1Ld2ffvqFC9Fr3_x6_re_8x_d6iV554MXn3j0o7zhjV_M07_zvzDL5OuF0l8q4x5Spfu0JVzdWu8MZT72TAvh74qTyZgk7RIlnRDatFC9ujXCGkajIf3FRaSOwwIPgIM8QFytd0ohWhUsqExBWZZESeplnvfRJFzrLhf6hZ0NIJ3Yh-wJ5yjy3AuwKDVvjjwwwue6aoR1-liHWmH30DqiLMpW7W1OdWpqfMI1QJAMnC9nbehFc17rAlBKY4yjMgYl5q039Wf1eI8fOC6kIu2kjMYjTO7bS8qyZLp9hSjpECcx6J6npNXvrxKiZJFqNkRSopX4luNLK_9HHEef6K_ee6uX5Z2_YxVXPsUf_Juf4onnr3SFjv680NFpnfT8HbQ1Ox7q8lThw0BbeKF-U5JlUxaWlnzNh4MsBb-wyiInm83oLyw2QANy7lRztoJs1XzqO77fOcuioCgrdBQ3oaM40MHU7n0yxjIcDLDGtM7Jh1KmqojiCKU9KilfBDC57qPmHQaAQemIIs8PEaYR-9-f-nP6nVAG_qM_D_-vivzNxxg7vyaiVdsL5yuVDyM7vS5lMcXkQ9-TNriMciNssUs-2UaFgrFzdZSg0ekCvmfVESl5bxzrb_sffv7XxZULj_Pbv_ktt3Rd3tGO9a53_QpWRpR7l1hYWPo6paP_SEWJUHG6D52rAwgpHKacNfQZCZiiAGvp9notrl0bAvfONZuN0VqTpN35AmsRXJv6FWIf9Qgx372sc0RRgmqAD9FKp0SLtlQ3EBp2tjYxRdHaPeYF2DiKQ95zfbXc69lhBQEdR8yyGda4VtPjPKxso53t17maNV_nX1KhogQVxZRl2aJsiVaNrOWUShKnHaR0VNkexWgdygFKVUhm5ON1bLaLFhVShIBQCFTcRSVd3_MmpdQ6esd__i1fc7zf7ZPu_Jlbujbv6FDwzLGcYitn4dyX9cxk8z-Lo-iY0AlKx_sq90JapDOeTpQNcaZA4ZWD8tkMrWN0lOxboKIdpjnHbDJlcWkJnUQt-lCrMLxv1kZdAwrPkaGNXenARFf7CbuN7SfcylAGMKYKmhXzsNE6R6SjJmT9XE0I6PT6IRc0_v0ODJRrho0IgayVoFwIzdrFaGeROqLXW6AKAEZdo2skFHF-17f-WqkoIkkSymKMYrEBbBBgiyGTraeJeqs-t4r7yKiHkDE67mJnGoEl1uq1i93O6_u9dP3Jy1du6dq8o3esY295AlNNsWZyv9Z8hda-5iODMItzBuEKyukOs-FVbDGgyodIgqyyc0xHQ5IkaXKrJr-qE3spcbaiyDJ6C752NUfJ5lA2tGtYaj8iKYRHz4Tn9UmhDpmS7W0eutYhpsMZcw3r3lQmhIGS6_vVi4eC86d554zTDghBWZbXoJL70Mp2EVzMdynE_muQpB1MZQMdqX6ODGz-oFZV95ApTbe_gK0qlCCElF4z35gcV-xR7D3PdOtpRhvPUk52EEKi4h5Cal-EVnKlk0Zf-69-9b3yzNKt7eG9Yx3LOcfVD76JJ977s1SufLPS7mgUx0RxJ7RxWCQF1WyL6c55st3nme4-jyuGyDCyxlaGLJ-Rdrvhi2xVTFr5TFnkGGtIOl2snC8Mn8fVj3kudbiSmF-MSkfhdWIOZ9eoW8NX8DA8IXcpqyrIPLumcG2MQSodEMe2Pkfd4lFD94c_avjetiZbaR2jlKLIsub0bZOnunk2GHJDJ1q7cvjZtZDQKEkpjcW6-bWsUUknZBgwPr-BdbodqrLEGdPUB_Nsxu72JkpYlHREokSaEdlwnTKbeI1DFQcARogk1m_7xq_-opWlxS7b7_qZW7Y-71jHeuSRj-Cs40u_5x8nztpzUSSHSmniOPW4gs2x2Q7Z3mVUNSJiiisGCJs3RcqiyLDOkXa6c2hZtMmuAokkL3Kk0rRzN79AWqwG4VswXCs0u2Z3cCBV1PROBenK0FPsF6prnMHfzXUUzXeQYM4RflcTi0ILiBPsbO0wHk2a313v4YIuYGv4Dkopkjj2ehRtCYNaHqABL1r8yHrSY0uops6pojihLCuMdWFAkPIgi5zvgq5F8o2ShLIsKIqsmb-lI0mRTanKMnRGO7S0CDOlnGx74VKVhJAbtJZ3Ly31ji8u9PiV3q3bte5Yx6JzD9l0xHB7fcGYijRJBlJFqCjCmhnT3UtMd15AVCO0ML6bt25GDIBGls1I0pQk7YAKi7p2qgaxc-TTGVEcoXU0d6yDKN6-sOlaMOFgb9N89Oj80Q4pPfrlF6cxtqWB6z2rzHOsNc2OUttoMGIymnCI8uc1VqN7IlC-kL5Ym-dZAxD4kE378PXAq1tHmX_I1i6mdexlzoyZM0gIRWZZywQEZxOSKE7RccxkNm2OEccJQgiybNa8rRAWJUqqfI-qmiGiOOzyDqc4oiN1b68X81AxvmXL8451rG75fiZbW7iqTJWzO0kcIZRGCstseJVychVhxujQgWqdZTYdU5aFF7PENmGgCOGZUHLOvGiJ7ZVlQZKGGleTxLcFVw5xpGvOOPRHubYrHNoy3PqT30WMrfYNeXMOqrLEGrvvtbUwZ1Xk10yyv57tg86RdPsLlGXhC7tCXHsDOfj6tjZGfayw--rYSw-URZho0mKXiFaoW6OiSkd0-ovMZnnTDiC1Jk4SsmwWmjJVeKsKZ6cU0x2UtE1KK6RYkEq87b2PPidXkgV-_ud_4paszzvWscws5mu_-68QCUw3UpuRipTSClfNKKc7aFGiaoxACpwzbG2tM5uNQ2OhIy8y4k4HoeahSQNDh8ViraUsK7-rNS0itR0OczvrKIpyX0s7wamKPAuCKmLfpnLospUSFWmqqvTtLi1xl6qqKPLS63MElgZSEicxWVa_x41bTeNKOz2sc5RF3pxXA6eI_TeR9kiefZeh1glRnqScZ9MwWaW9q9X1vhASW4cTkk63R1mWWBdUc6Um7XYoyrZzhlYXabDVEGvGKM2c2aHE1zxw7ujxKNIcF7cG-L5jHUsvSBSQ5_l4sdspIqX7sZaYfIywub8Z1hV-IbDWYExJnCQgFJWxVMYecJhWWIf_0o31XLUk7R7S7n74uVVlyfqVy77YKuYJP85RFH7SBxz0pP0TRGoH1jqiKivPn2uZNdYfy7W7vgRpt0tVVVhrWkOBbswEgiTpoHXMbNoa7iAdAV9vnV_rXGzFZDzCtCeRCJBKEkUJZZ4fGKPakhyQksoYtne2MMYQJynGWExlmrA6TlLyosCYKjC3RPOvkl7Yx_M1m4L96wTui5eXelTZhE-87z03fX3esY5l1R7v_Zc_xsbWdt7tJA9EkT6ilcBWM5Sad6-KwGszgQOnoxjAhycIoqTj277FvAXcBWItgYUTJQlKJw2Sd83esm_NCZQUFNMxk8HAi6oEh7XOkee5p9tzsKHyQD0qMAx0FFFVnslevyAEfQx39qAdDgrQkabIZ1RlHtohb9y5HA4pNd1Oh9lk2igFN-Iwh4WtAoo848nHH_OvEXMwxOGRwdlshrXuwA4_z8usNWxeXSfPM6K0g4q8vmBdS4xSLzlXFlk4T_-dthtLCbisEAolxbJDfs8fPfLCYrJ6jGTlc6_zvVy7Yx1r2awQL_dZ67s1g32HlESuyhGuCqF7O573KJpSGq01EhF2E4nWOkzO8LVK14KMvTN4LXHRcPJkq0Yl9gEA9Z4nhUQYy3Bnu9HQqL_-bDrDVCYA7DXCphrH3mehAdHvrlV7LRKpmJ2ru-TjWWvgnCOOI4osY7w3CO855-fdkAmQUjHa3QVjUGE2cR3eeT0KFdDF-VwsU2Rgq8bpawJyp7dAZWwAMGr-pZyDHk4QqQjhHLPZFKkjdJyQF0XTNaB1TJKkmKpqdRTMycauIfh6mQAdKaRW37K0uvTN7_tXf_u6NcNX0u5Yx9oelOR7jxMl8dc64b7ECUtVFV4880AsL4WgzHN0FPQghCfVpp2Oh7-lmheERVsxSQbGhG8SnLduiGb32t_UOG_NUEIw2t3FFAXWOZx1KKEoZjPKPGtQu4Z7d4jsmsCHQZGOKPJi3ySPhcVFemmHrasbCFs1Fako0igpeeH557GV2Xe-L23egZSSDHd2qYoiIOi11I3ch2DWdTARcrv5ljqvW9WhdrvojGy1njiB1hHdXo9slnk0MYr9zg5eckBr4gCCNKI9jRaIaImRiqZDOU2ipSSO_tyf_Tv_ftkWxSHqxq-s3bGOpaTjyOu_N43i5E9Fke5LJUI5KfT5SPblQmWRE0WRT5YFKKXodHuh1UE0DG_a-VMIC-sknHbCfshd0NUTQa1FCcV4d8B4sNeMppFSkU0mDHe3D-RG1x5J4jUJtdLEOqaYZc2UeglEUUQ3TRlubVFOM6QLzYFSsryyzAvPPctgdwtB7XQvbTUrKdIR48GAwd7uIXJwNZwxzwml1CE38nmgrMGaQMaVSlPk2QHfFvNWFKlIO10fMjpHEieUZYmzoSitFDqKmM0mvnGy-a7kvhxWNh3NijSJSbR8aDYZnMymY6bP3dyBdXesY7mqwGZ7i7HWr4l1FAqPoSWiSZCD9rmzWGtI4rSpTfnia9wKwfbf1dtsc58fXF_8sm1eAiKIguU5e1ubYPzoGh1FCCPYWd_w0xQxOEwzfcPHVdbLBdgKW5UI43_eWr9MNhyQjYZkoxH5aIJWESav2L50hXIyxWQzKApWFpcQxnL5meewkwkuz7BFjisLXOWlyjCV3-lshbDGT_oIxI5Ia6bjMRuXrvi-r-bc5gyPhtMYWleSOMaU5f6Q04GSik4n9XWopk0lLL4gh-2kpLew6EeqVh6BtWFOsX--Iul2KYoca6vWMHQOAEl1bu2II0WsxUKZjZez6ZDu6dff1PV5R5JwnXN84j2_iLEuSbXoR1qHZLbW5LPNxHeHwJjKI05xHO5yHpXwssyyxSpoMSVa095NVYU7ZQhzHM3O1raGRx-6X7WU7GxscOre-5FJQhwlrC2tsX5xnXMPDuitroZSgMVZhzUVtqpwRUGRZWSzKaYsGG1vMdzbQ1emSdaH2wOUjFhZOcLzTz5FNhqi4wipBLYsObK4zOjqDs-YT9JbWfIav6LW0QClFUprlPJ6FzqKUZFGaK_BkcQxm1euUM5mxL2uz71wGGebPEkgsbWylbVk07EHZuT8eiAFvYUFRqOR7x9rTSMhhMLOWTrdHlpryrIg7aSALynEHmui0-mipMIYg9pXBDh0haCVIo5Ul6I8WcwGbDzx3E1do3ekY33yI_8GSYnFyTiWUula3Yg5q6GZymgpyxLjLDpJmoRXKo1S0TycqGsztFGrwB90FmtuTMZYAKb0jtztdtlev8pkOGDh6DEQgsXlJdYvX2bz0mV0pLHGUBYZVZ5TZBllUWCLElNVmDAUm7LAFQXZeOQL2CjPfK8qFhaXSbbW2dtYp9frUW8wwkAUxwx2hmTTKUknbuYYt_sma80NoTSoCLRCSEsSRdiyYndjg-PnzoV6U5A3cLSIUPMMcXd7k5Pn7mt6w7xJ4qRDtrmJrUpkrMMMyTCONmg3Sh3jEEwmY9bW1rDWkucZcbfvF6qOkFJ5AEOyr4C__-qHn5wgjVVPZ-JLvvrb_qtfvfrsx-2NfH-fL7sjHev1597CJz_1bpxDKym1EAIb2NA-vq-17XxIVpSlnyijIx-bu5poW-8yooG356PPvAkhvaNU1Y2whPyxjcFWhjhNmI0nrD_3PL3-AnmWM8tmpGmH7ctXKGYTtBJgKrC2NYvL53YCB8YSSYXEkc-m9Ht9wBIpQVlZEIpTp-_m-fOfxpoKKSMs0Ol0KI3gxMnTXLp0AWstnW7qw62GUAtWmLAcC6wUGCcwrkJJRaJTNi5dodPtEiWJF8CJVAMaeAthrtRsXr7C9L4B_ZW15oZlHcRJB1v54riO09a1DTdCATJIHkwnY44cOeIFScsyEKNFAzIVRUGvGV0rroPJ-JtHGksi7d52-dlHV52ttrwj3xyE8I50rI9sfIrYWpTUK1pHC74lIYT89a244bZZyrJAST-1o5lU6JjfMVscN5_rBHcTDiklVVmSTaf0F1f31V-uscBaNWWJNcZDv1Lw_BNPkCYJlTGUWe7DFBWzs77F6soiSrbiyPYUReehboGlE6cMd3bpRglCa6w1qDCRvr-wxurKKXZ3LrG44Bd-kiTkwxmmdJw79wDnLzxFWU3o9hMv_-Y8pCJqiXkcwjlUkD-LVIRWEcV4xoUnn6TT76PjmDhJiDsdkm6HqJMitMRVBldZJttDLj93nvsXl5AiarDEKIpIkpRsNqO7sIhDziV-6nKEVCwtrXDl4vM4Y4l0jQLWwJJCNWihu1bYlPprCd-dc8SRJFL2blNOjztTbTG9edzBOxK8uH_lHFef-TBxEr9RKrk2pyTN5crqhx91U9LpdJBaN524CBpWxcHaVFuLQmqFVIrtjQ0I7IfD0LxmjnFVUeRZw0JYWlnBGcPl889TTiahiClJ4w7ddIHBYOSVDp1CWLCVocwKZqMZo8GUvb0J2ztjJjNL5VImuaByKbqzzNqx00RxB0TEsVP30O0fZWt7yGQywxjQSnHxhQt0e4vce9_rMSZmb2dMnteUoRDazXETj9U5iKMYYy0rK2uMBwPy8ZDJzjaD9StsX7jA-rPPsXH-ApOtHexs5l-jYi4-8xzldMZ8gDNIren1-2St319LSoa01ycvC7K8IO10sFUVxqf62mCSdnxh34kmVz68xywU15UmkvSK6Xg5Gw8ghJU3w-7IHavICt7yp_9Gsvn8I2_XWiRzPxDXprTWkuUZiwsLPlEOs9Ocg8raeZ3nABRMLQstFb1enwvPPMc9985I-lErhAwr0lqcMeTTGbPhkPHujq8hOUHa6VLlBlcZiiwnTVI6acLe3i6nTp9jfb3k6tVdkiT2AExw9ChOWVzoEycdkiQljlKkjhp9QqGC6KUVQQot5dy9D9PtLbG7u8W0cDirWFxewwlNr9_jtQ-9mZ2ddXZ21plMx4AljiKSKCZWvkfMb_6CNIqYzWakaZck6pJNRvR6PT-wz1pMWVJOp8x2d-h0u1R5Tr_f49KlK-xcucrp0I1c39ySTpe93cuYskLFcdMW0r7mUZwQJx2msyk60mR5UNgNCG-apuTTUZAJV7WI73VNCoESdKfZ9PhodwObb9-0NXpnOtZsSjbLl3D2Qa3jFjE2ZA9iPpnRWYuz1o-62adl4ZsFnXiRUD3cURcXFxkPh1y9eIm7Huh5iTMHzhqqoiAfT5gMR0xHI8ps5vX0rKcSJWlCmRY-gZ_OiJUmUoo8yxmPMu67_41sbm-SpAmdbo84SvGd0KqZu9Wg1PXMhlabOwJEFPnJkbbk6Km7OXriLs-IdxYVmiEtoJKUYyfvYvXICWazEZPJmMloRDYdMyn8tEkV6kHGWabjDJzi2LEzPPfsJ0ni2MutNU1aDlNUjPIMhwvnr1m_cIHFlWXShQVk7GuHnW4XYy3T6YR-HDHvKp3fCJWKWFs7QjYZs9Dv4YxpQkVCjuyFSo0Hnq5rdROmQUjbLYvyi7_8m7_vVzcuPWmdMb7g_wrbHedYjz_6cUaDZ7GOjjLlopJpoBrNGWrtncsZg7EGncRNx2vthJPxyLdHXOdLqnHCTq9HmiQ8_-wzHDtxnDjtUBQlk_GI6XBIOZ2GztfQtliz2p0fy1oaQS_ts7hyjCuXLuGcYGHxKKtHTpJ0lzjbX63TOv86Mc_XaJDOuaSZv0srz0qIY9KlJVSkycdj8tEQqLxTNjcYF8YUBSAgSulHHRaWjnvnqEqqPKPMZkwnY0ajAbaquOueu-n1VhFKsLZ2jr29yywvq1CiqHHXWs_dkiYxx44epRiNef6JJ1k4coTOQo9uv0ecJKRJwmB3j4XFpRCGhqpiGMTgHPT6C-xsbtBLE98aYyuUiEN_V4QxlsoY5HVC8tp8f5lAaYGBr7x08alVW-VbVDdnSN0d51gP3S_52PtHWEfU1VUspWgKm972h4NlmWONRcq4Na9REMc-ma6KgriTtl5zQIEIh9YRJ06cYrC55RfM8ipZllHmGc5ULR0VESYtVuRFSZblGCPo9FZZPXKWxaVl-ovHAUmvt4TQETKOETrGVJWXOWs7ppwn7o3ybN0cqDVCR6g4RqW-Nb0TJ0SdLvl0jC1Lj9hZN499ayVZF3byAJtLHZPomE5_kcW1Y5xw9cA3hQ0gz4mz91NUJYPhNr1u4ndVEQCW2smE8qyJomRvYwuBZDQYECUxnV6HcjpjsLnN8RMniNLUf756ikq4AcRpB2MtRZ4HvQtDLWSglMJa5-uK4qXYj95ZoyhGSu6psukJZ6ut8d7WTVmnd5xjFclrUeJjRDpajpTry9ASX9s-qBw__Bp8Ij-XNROk3T44yKZT4s5CWHR18hQa1oXXD1dSsrC4QDnO2L66RTbJiOOkScJdCGuKmS_qFhV0esscO36ahcUV0u4CLizS7uIREAqDRMUJndUVVBJjjMXairCSG92_9rTHhiXS1umDIGIpQCl0r4fqpH5kaT3vqtn9goi9td6Rq8qXBkyFLSsq49tT6p6nuNP1SGaeo5TirvseYmfrCjtb60xnOUmsSSONkiJIZUPa6TKdbVMZRzGdkXQ75OXEcyRnGVsbGwzPnmHt-HFEFIOaMxFxjkhFdNIuk0mGcxJbn3coaoNvvek0RYODJlo5siBSkoiqR5kvOlNQiJtTzrrjHCvKNrn41KM8-MVf_bC2dqVpItw_Rcbf45ylyDLiKEYr1YKzfct3t9NjNpmwuGoOjPgMZv24HJMV2KIiyyqWl4-xu73B8rJEaom1kM8K8ixDSs3S8kmWVo7R6a8gQ4tKLTJppUAnKTJOPGKVpMhO6hsaNUji_XOw3HwXbZyq-ZW4hmBEPVNYab-LK9daZvs7EZUj9GvVjmYwZYEpS6q88IDD8hKJEBSTGcVshisUR06mrKydZHdrne2rl5gOB3S7cQO-aBWhpMZUJZPhkCRNkMIhjEUjyEZjLjz5NFVZ0un16S4soOLIM0CCqq4Wmq29bboLvRBp-puelMpLpFUFtepau-zR_rThwqOVIJZGunKqbFWwkLwaCh5qpbV88w_8o-S5R3797crKVEgXpgC6A4igh7-rsqTT7SCVCsuoVq1VrK0dY3tzHZNlqCRtWkUcDmfBliXZcMRoe5dsPEU4Q6_fQ-szbG1dRSs_VbHbXeD0ubtYWlpDxV3fUiEVRgXakAhDEbQm7fXQSXqAEjUPh1wbbWwPkJt3bvjcTcy5e-KQfMO25ANCrbwJmT1aB7iQxGuF0hEq8buwrSpf45MaBKRLMXG_T5lllNkUUWQcTbqsrB1nuLvB3vZV9oZDIiVJ4ohOp0-e71IWBfl06ocehF243-0zGYzYu7rBKNolSlPSfo9-v0cax5iygNIwG028EE3DePGhXZImrYbK_eH7XCKgvi7OTx_CySKb6SKforunb8o6vaMcyzlHPnwek20sIXlYCdna9N2hzzfW0Ol2WxM5aL6QhaVFNi5d4OoLF1hYWUNHkR_dbSqqomA2GpONJpjCIB0kScT6-lUeeM0b6C0epSxyut0-ne4CUsU-dBESEUck3V7TtIf0PUNtkRpnLaYqm1DHOT-bSgA6iuZs-nnV-9rxwS2HctdkhweuxSGdI65FbWo7pgxKvc3YWAdCKRIdEXe7mKqgzDLEtMtK2mP5yEmK6YjJcI-9nS1mRc4kr1hdWSbPCtKWEE-v36eqKvLJjO6CJBuPySZTRlvbaK0CJaxEOBgPh9jKNDccGZynCGRfF-42L0am8GmqjLOiWhnubFOW05uyVu8oxwJDPhlTZnmvzLPlTmceEh1m1hqKIqe_uFT3lwZ2he-P0jpieWWVi8-eZzqceECgTuxtEMoMm2GWVwyGU6yLKY1gZfW4LwiH4rKVETJJiHodok4HFSdIqb0GoK0osxmT0ZDB3h6T0YidrS12trcocq9ZKLRm9cRxdBzzutc9zMmTJ-fMcl66neqliDqH_d2WFRfOP89ob9dzIZ1FK42KI7rdLr1-n7iTEicJUZz4HEdpVKSRSUrU7WGyjGo2RcV9ur01jhw_S5ZNGE0mdDspw90NNtfP0-smvhYnFYvLS-ztbpN2EoRSvmxhKqrcNfrvnSRld2-XqqyCaKq_68RxzCybBqKzfJHPG_BhPye5I4R441d9-_f_ymDjotvd3WVlZeUVXal3mGMptq5cBCH1dDzQK91eQ2M6jMdnK4MzjjiKW5NDalloh8OyeuwE2xtbzEYjup0u1s7JvALI8oLJaEoU9zl99n6WVk8Qp31MPSQuTtBJiko76Dj2dRshKYuCwfYmVy9d5IXz57l84Xl2rl5lPBqRZxlFngUUMOjwJQlveOuX8hVf93UsLC2xry_v801vayk42aLk2ccf5_GPP0I2mTTTP3Qck3ZS4k7KwtIyR44f49iJkxw9dozVo0dYXFkjSlJUkhD1uphZRjUaUk3HJL2IpLcMQKfbJ0lTtjcus7s3YjydcffqcdJ0xmQ0ob-0EHbtEMo5n1umaeppUFnW9H4JB1p7DqGztpHFf1ETAiGdKPLsK1948rGVqsp2Vs6efMVX6h3lWOX5q-xsXgKUUOQo1fN_OMSpZBgoJ4RneXMwXAr8wKjT4cw99_DUpx6jLCsiHYGDsigZjcY4pzl6_G7Wjp1BpX2M1Mi0Q5z20EmMiGKEDu0npmK0t8uFZ5_lM49-gvNPPMn25gbTyRhX5wVifh7eeaXnsxYFT338E9x19z3ce8-91zQYfj59qz5WpDW9bofNyxeZ7m5jyoKqqqd6wJ6zmAb6V8RRRNrpsLy6xql77uaeB1_L3fc_wOqx4yQLi0SdDrMdTTYcIJwNaCasHb-LlSOnyGcTxqM9ut0eURzx9JOfIu7EXoekGSru621KaRb7fabDIa4yCCUDE0aG0oRF3cjqFaCUIJuNH9jceOEUzuwM8_e_4mv1jnKssXmcbDxExx2ZpqBfJAwEKKvSz_nV_mO2UcN5outYDAvlhWfOI2YZpvJs-OF4xmtf-xaOnbybykkqoYn7ffpLK4g4DiI0YKuKncvrPPbIIzz-sY9x-fxzjIeDfRJk0tWqt84z8QPlxgqLswolBOVkygd__z2cOHWK1zz8cDNw4ZVhZAuy2YwPv_d9XHjqaV8zqtvure_SVV7DwCOV1mFMxWQ2Y7KzzcVnn-KRP3wfq0ePcfdrXsvrv-RLufv-B-itrCLSDlQlOlKUswnFaIQTgrQf01lY9toYyvc1b29tcuTIUbSO5nJx4b7X66RM9gZUWU7U7-Cc8AMvwiSWa_kTdWF-P4iltcW5rJ_no2WcIbavMi8ae-c738l0L-fiC5_i7F0PKykT4YvDbl82L1r3d1NW6EijpcY52TCiXRN2eJa0kJLjp88Qpx2GgwFxpOl2u1y5tE26uEyFgiihu7BI2l9EaN_Ob8qCqy-8wBOPPspjH_0ol557zif1vu94XktyttVu77BhRGrSX6a7tIZUCq00iY4QUcTFCxe5_7UPeZ33z3scOOfXzWYzugsLvPltb6e0hmmWkU9mDHeuMtm4gsnGGFlRlQZjRd3A5QnP1mFnEzaef471Fy7wiQ9_hLvuvY83fcVX8NAXvZ6l1RWkEOg0ReiYfLiHqyosvtVF6JgjJ0-SJDAeDlBCkiYdIl0vSS-Mk00mDLe3OdI97csVUejLMiVJ6zPNIRzXWgu-l04Jg6JStsgjXEWu81d8vd4xjnX8uGZUlnzXX_kX4o9-9R_HSayCGpNraGf76jVBw0_UopDiAHzU6gZ2UiIizeqJY6weP-blp6cTZDwi6vSJ-8skvUVU2vFag65i69JlHnnf-_jkhz_M1pXLfoaVA2UdzlbgSrS0pLGkmygWux36vZRux09z3JlWHHvDV_BFX_9t6CgBa9C2QmDo9nt-vu4r2jvk6K8s8TXf_A7PJVSRLxNUjuHFZ_j0b7-TfPNZIu0YT2fsjTIGw4zhZMasMJQVWKFQwjdd5oMdnvrYgAtPPsXHX3M_b37bW3nwjW9keWWFZHkZlaaYbEY5m1LlGcgIlcScu_8s1hrWL11id2ML6aDX7RBHvncuTWI2r6yzdPQIupOC9IJAtkVNerGrJIK-icSR5VOBNYhu7xVfr3eMY126Oub0mSU-8_EPKiVFEkcS2eKiXpOJOEtRFohmIofbt5s11oRafhJ9zVCoKkvlFL3VE3QXj-IDesdgZ4tPPfJhPvLe93Lp2WdwVYkzLlCHCrQoWeorjq70OX5kmSMrXfqpppNotJRIqXFWsD4qyfoxR0-cJF0-jjAlqpoibICSnWl3Zr0ipoTExRKLQugEFaX-3S6UdEXO2RM9eh0FYonKQlFaRpOM7cGEq7sTNncn7AxmTEvlBxNIQTEb8vQnP86FZ57izP0P8OVf-9W8_i1fTNLvobtdonyBYjzGOovSKU5JFtdW6K0sM9kbsLe5xebVqwwmY7rdlDROGE0m7G5vc-z0qYZwYk2JCBHHi5sg0pooUlSzHFxFlBWv-Hq9Yxzr5KLmbjHmE1kUWWM6Uh3QaG5boPBYY-gknWZS43WXqGs7mCfKmAqETIm7SwgVUZYZzz_1BO_7zf_AU499inw2wwFGKOJuykoiORLnPHBqgRNrPfpphFICJfzAOxrhGIsTitWOYmO8xfDyedKFtcDnq4JDze2V3bPm18vZUEubjdl57tN0mNFNVAhpLbFwpLFgIYk4sbrKg3evMSksm7tTnnhuh4tbBTMXUVpPkK3yGc996hNcvXCeC089xVu__us4duY0KolJ1QoqUvT2LvnWHSmQUczi0SMsra1y_NwZdra22NveZjqZMZxMufjCRdaOHUUpEZpPixsa_EDYtbQW4Er_eUbDV_CqersjHMs5x0ff_xt8KDmNHj6XOOG6UinZsL3hGoUlZw2mqgKnr10YPky2rNZxqPMP32GrIl9n2d3e5EPv_h0e_aP3s7uxibEOVEJ_eY27H3qI17_pjaidF6ie_RCnlkBrv-OIUHhtSLQh07JCkChNt8jZff4pVu96LTpNPVtC2BtWAfxcrcZ-ZBj5I5CUO1tUO5fpJQ4VzduyZQMK-FwxxqITQf_EIsv9Psc3BerMQ8xUxFOPfYq9q5exWUY-HPGR33s3F556hq_4hq_ni77sy0i6PeLeAp3FRapqFNDAeuCEJekvcKrf48SZ02TTGbt7e8hI-6EVwqGkpiwq3I1u5wEZ9HDJy5Pd_mztjnCs1772tfzrn_2fYToStixipWU30kqIF1mCtjLYWpnp5YhWhoTNWItUiuHOFr_9a7_GJz_0Aaq8wIiY_rGjvOZNX8ybvuJtnHngQVLtePq33kkVCaR0IBRKtuiHUjSTFx1e8kui6EvY3rrAeGedpdN3-5AsaB_dHNdifl2kQDrHbHcdWQ7ppAqlbOjgnbMwarqV75gG5RzLHc3x1Rhx8giv_bpv4W2jCc988uN88gN_yNXzz1JNJ2xcOM9v_d-_xMb6Ol_9Te9gadm36JtaOlu2urddYN5HEZ2liO7ykh9XZA3WmaD3buf9aS9qnvKlpAgjZ23D5Hol7Y5wrH_64z9MVRaoNJF5ladKuK5SUs41YGrZs_mVNsb4L16HXqsXu7uFsak1m90JyKsSWwk--r738NhHP4Qxhs7aMR5485fx5re9nXMPvAbd6WERVLvrlKNd4jhCxH5-E8IfBxXGpIau31qkUgpBL1UMphMG25dYPHnWF4rtTZZDFs0MS7Al-WSLODYknQgl5ohmfW2F88RkEVj4LoiELnQcO7vr5NOMtbP3cOTUWd7wZV_B809-mk9--I84_9gnyIYDHvmD95AkKV__rd-MlIKqNE0ryzz8EPt67Gzt0mFQnlQxZZFfww49_MrVbfqe4SGkYOBeDQUBKKIYLR3O5MpZ05VK9pVSggNwhGgxwovC8_DqLtw2wnZNXci5Fi3OLyJTVUgXs3F1HaKYe1_3Zr78676R-974ZlQYdWOsH9mWTwfYbECUSJz2Q6uFVqhIIZUELREq9FCFmVAWh3SanpRMB5sY44EWz8oX81aQV9ja0su2zClmeyQLirifBMcynhkR-ressVBZnLHIyrehSAOd2CHLEdO9HfonzoHQdFdP8vBbT3Lv69_C8098kk994L08_egjPPX4Y3zJV78NpTSldTgnWpxHsV9moWn6nM9a1lFCnhc3tK_Xc8K0koEHLbB7r8LtAMxMxb2LXZ7cnWlrbVdp1UMq6cQBTnd9t3NQlIVvCFTqZWFrvqPVEz-7i6u85e1fx71f9KU8-EVfzsKRk1hkGPBhQz2nJBvtgJuhOxLZARVF3qkijYxUeGjvWEI2-KRz0HWOWT7E5DlRNwlDDMznn25xHWvcSoCpcopyQr8fEa92fNiEC47lH6ayuNLgigpXVNjS4Eov0aZyS5GNPXFeSN-UCMT9FV77lrdzz2tezwd_81089_TjVJXnAFrXmkh5UMDiEHDC69knjMfjeV78UpA7fuSPH_sjoHzlr-sd4VhvOrPAwhsV4j1WGVMlMhGpJ7a7fUTMOYjhRTqjOG52iLZdy2QQ7TikYXTHccpdDz5EhcZGXYybaxHWw6yxFcVoF6lKdFd550o0KonQsUYmGhF5B28mlrSaxzrGwk5BVRTIXqvpoZYFe4WdqwZsfNuKQShH0knRC3GQZwxiZcG5ZGVxlYHcYIsKkxfY3BAVgsRJTDb18tU6wgVdRxvUc5OFFd72Td_Kw5tfxOrqIntbE6-U9TIGFjic7xjYt9u-iGuJlmMJkOpVXcHG5CNXqP7-uzF_42tkWWVaShEpERow9vfvhX8cVVkQx3GzQ9R2Q_QgJ3DWT91odMGsQUjrl5lsVc-soZyNSVNJZzFBdzQyjVCJ9qqvev9EDNdyYuEESUejhMWYovkQTcrRDOl65VGseu9POgndxQ6660VDGwwt5FfSOq_t0bHI3CCLCJtXuIklKSS29LORBTo4rGhaU4yDqNvl-OmzCAqkjrDO07zmeMJLf1apVCM317zkJarEUgpf_lA3R_HvjnCs2b0nuPiDd2HFRGJKFelESSGvvZT1eg-8tjjp729iuq5dm3OJIF7ihSxtU4uqkT3_PAHGYKoZ6UJMshQjU41INFILhBb1hEEkrSbKwNR2AnQckcQxjTb0TUMDDzOHVAIVK9BBE7DdaRmuDVriInDaoGKNiyuUsiRTx7Qqgv7i_mhijir6vmXp_JQSbLi-zZNuwLFqleBay-PFbpaB2KuVJIoUSXRzlvwd4Vij3jKTY6cF249KJZyOtYpB6Oup9DhnW0MQxL51cfiOtf-W5_us_AgaGlDfNrtJ7RXS-WmE1pXoVKP7CSKSCK1A1aKhNJ3JtWSYq_tcfIwSZiCLffnCS8n-f77NgzbWh221iOe-kUVzAt58_hig_OeV0qLSqsVemZvYF2IHMRvnkEr7vzTTXOoXvMjnFgIlZUDl7bwN6BBNyX07rRSkcUSSRETdV_563hGOpfKMxO0wNpWUGB1r3ROC9Bo9wHAljTFUVeVZ7aI98-r6cfhcudXhjMMYi9LRPIx0noHg-7i8WmxN8kQ5ojRGJhEiCiGfFIH0K8PoVQlEIFYQuodzYyh2KKuComy3mrs5_I99xcWKRWj8rBd8I_eHxIThC1LQ9LNZBE4EnfkwYMLKoKqbhGmWAdmsJ740TQjO7Zd1k8pLIDiDwr5o02pzvi6cszU4Y1oTJOfUtoPu5bAoKYnjiCSKWHrlqYK3v2M55_iDd_0ik92xkL1SI1wUaX0CITr7nxj-CUKc1trgWC8dWu3jGwZ6T2WsXzi1WhNe7dYzBIKunnA4YVFxhO6myEhDDVDUwxmE_28rJE4voXsPo9ITWHOVaudRquoKxjivghtqRo1MzE1CBuuwqp46YpEYEZPJCI0gIYwlZT4myb9GUskEhEaoGSLeI5YpQuq5XmALUhLWgPO0LoEIn5nQKf0yhpALD1BZU7GfJOCuOcq8LObzK6XVTQm2b3vHAihsgeovQDVSsRSp1vqsc-xPssT8hm-sr86rQJx9OavTo2MBoJf1LETXcPlwCl-9ko2gi9A-HDJKY1SKQKNwfudSEcgIIRTIVWR0FMQaQhYgEkzlECpC6dgXMOu84aVyh8-nhZ3et18JjBEYETOTPaTUKAGxUCB0cy2EBSv66M4pVLxINXoBoR9H66Qp5Io6o3KEiZO1Y4U8E-k_qr1Rpwp5X2j5udHRSoRdV6kwGOMm2G0_FEEIAZElXUyFNZWUko6QcuWwBsD667Gm8vOUtH7ZWYpA4AJdxheXwyQODMIZhLVtXC-IzwjK0lKiGYsemV7E6QVEtIiMl5HxMiJaAd2lsjOc2cHmW5hiTJY5pOwSR2mgD7m5LBnipuxYrnYWIMtLsqz0wZWIGchFhtEyJl6CaBERLyPiJVy8BL3TyP4DiPQuZHIcKxJUHGaQ7XsD56F8VwXnsiG99GGjtWY-VOI6j-Z6NBILLjSSzulVh37XgiYPU0Igb9K96rbfsfr9PokAM5uBK6WULhaCWByC5HmTPr9S2teOxFyT73p718EvxFgTWBuyKf6H4MPvKNbhwvAzITSVkWSZoRO6jEvZRWtNKrVnU8gIJyNKpyiKTeLqeXS5hcsysqkjTpfQkQZXNidU5zQ3tt-6VvetvHFndK380lmklCjdpSj2EBYiIBeaq7KLimMWQ5nBWEtuLDmKxJb0XUE522M2q-gvdsJO7yldNXnXC_RU4AwyhBY60iilg8SZexnlLBEc0h5oGbo2R5uLyniRGilehdv9hRGC1dUuL1zdFboqlYqkUkJec3WaSN45P9FCRz7W36eSex1r-Ey-pmLCQAMhZes1nv-NrbCiQgjlv7AoIe4skI8tyhhiYdgGcpGyEqUkSoPUTJ1gUBW4fI-1aovYzijyktlMcPTEEYT0DZIyAAdNI-ZLXB9nDCbLKLIc5xxxmhJ1OjTNai96cZuL7KW0VUS3s8pk9yLGQCodXSXYsJIXKslKHBFLSWErRi5nkg9YmQ1RYkw13KSqKmSUNhC3qIU2sYi6JcaZ5vdCekaKte7FJ1Mc-LKEFEitW2OYXnIVeSBJhqF5dG7gNZ-b3faO9e_-3b9ja-sJOp0lUWS7SkmhmyHeByb0iYCtGmOQYcica80Svp6JRn3c_39lLUjlQ5V9FGq_QKQrwUqsFEgds7h8mq2tJ8gnJXHHdwFfNRXD0tAjoqoqhlWOMTlHXU6sHKISDPdKyiqmt7gANjTu0e4NO9xqhrktS_LhkGo6A1PhsJSziKRaIOkvhmvw0tfYv5UHFHpLR9i6osgmjsW-5ohUFGg2q4qdqkQJ5W9ezpC6KbEZIKohxXhMZSOS_mKA6V3YP8MAcVc1dNoafRTIRj-x-WA35Cd-MLu1tnnhS212QtRy3QJ45edk3fY51hve8AYm4wFSKSlwkVYyat_bXFs6K_y2LP20DRdQcj-BnQPtI_OHcwLhZDOAzljQOkEKNR-40IQQBmEL_3AFCFg8eg6ZnmZrvcBNClaFY0EJRlXJxdmUK7MZRVmxIiRHIk2EZjQ0bGwW9FdO0-v3EbYMtaNWjeg6JkJbzHQwpBhNoPIDEDyiaSiKorXoXtpEwDnBsLh6hLR_io31jCoTdJGcjiJOJR0f2hpLguCIdJxTM9ZUhjKO4dAg0hU6i8s-h3IW6SqkLRGmAFchsaG4SwBLBCpoLzaTjN0NbLPCD0gwnrR53emOh33Om2W3vWP9zM_8U77yjQ9SzWZSOBdprSLRup0fvLNbZyjLEhmY4i__cnrESmnt2RKuPdai5sxVCFOgqhzhCqL-IscfeAu5Pc76-QlsjThjBfd3e5xJu5xNe9yXLnJGpKhxydULQy48N6a3dg_3PPQmX4huq_ne0C4j_DlGGiuhsgYiTdLv011Y9L-_gTt5czzndal13OP0PQ8zzROee-oqw80xSeU4Hae8trfIQ71FXpOk3K0VR3Ho0jHcLdkbRSwdvxeZpAgMypUoWyBMEXYsu-_cww9BIq3Njnlx56qBeSEFxpb72Pkv8ukabW5xE-hh3Amh4Nd97Rt49I8egxOnJI5ISRXTntxz4Do56yhLjwqG39ygc80LxMLRckxozwmq1Z2wJtSULU4qFo-eRqm3ceWZRzn_xEV6Gxlr5-7mzJETRHHKbDTi4hPPMtzaRKuEYycf5vhd96GjTug1uvGbgAOkknQXFzCdlOHOFlcvXuXehx4i7vVxdavMyyG31k04TrC4cpz7XvdW1l94hp3NkrgP3UQRS6iMZW9jm8HeBpQjsvGQItMsrt7H0ZN3h4HkOdgKbJ1XuWsrB7VstlRAtf9v1138Yj59Twg_zseP1LshOpT4rG60n53d9o51_Ngar_nqv83vv-v_K52zWioZ-1mh4U7XmtgmAFv6ifVa6ZdZwppfdOvcPEc7RCuj2VucBRNUmYSkv3yUe1735WxcPMr25hV2r0zppaAWYrTr0Okfp98_xdqREyS9xaYA_dIQxbVnWjcD6sTPxJrlBhGnOKlaw-Ze3jJqzkRIFteO019axVQFMo5wpfBTQwpDOYWdqxnFrCRKVjh97jWsnbwHkaTYchY6gD238nrQUR0ONjmWczfAvKi_Z8-99N3Hbt841etfMxHmVN-cOtZt71gf-chTfO-P_SKmGkrnjFJadREy4Zpl40ei7m5uMxoM0PeofdMnbtTqZr6mLeSwL1rQsApETR10FQ4_puf0va_lxLn7cDX7w0rSdImz9y41AxABHx59tkXglsMLodFJpxVGuZYo6cs7Zl3TAoHQMVoHlVrjwk6pOXH6fo4dvwdrHUIpdJTghMKYPHAqD2Sx1z2POePf1eHHS55yKBJLEZw3sECa9eAOf40IdTMhSF55UPD2d6xqMOW1eYmzUjpntdbqBEJ0mwtW3_scDPaGXHj-UiB4ypdNXhCNEI1DxRHuOnC3AKSY75LNqdQngkDqpIGca55BXchsZiZ_rlFJWEdpt8u9Dz6AjqK6hfKzUs-thwiA5zf6rn0zfzNRT5gEHbdoZE4ExLTOEd2LOlV7NKB3LD-rS9xQjUk0TabDwYjxcEx_afklvmj_tzqdW3rlQcHb37FWVo-ysnoXwnwKKUUkpbxHOKe8LNecI1YUJVeu7nL05FmK2cDXLF6MeHvAam0H4RzWWBKpebHu-EN_LWyza4ia2FrPo7J1ODJXa3WtPqjP1pwAFWn68WK4Ei60qLx8q0PMfdhBS3uiXVdrT-cSoaFRHkh6r-dULejJk5TdjSsn1YRhITRVFXHh-aucOgPLa2tzfuY1FtpYhPV6JDfBbnvH6gpLpHNKWyEVKVIcEy3xF8JOMNgb0emvsbK8wtULQ7w6mnz5d27n2e1S3RiBt7H2FnQg1t-_O70CybNo__i5H3__qR4STrcKy61mm3nudwPHdjW8LkXTskKtfTEX2D_k9SHwE4oTZx6gv3KUjUufIekkpL2F6xTVRTsu_fxf_0PstofbdW-GXt4TVlRCCRELIdIG_wnXqCpLRuOMY8fP-VGd6rNwqBbK6AvPt_2lubOt7idpTbXEWawxTKcTyrJ4SSjdFIaVlRN0e6sMtvf8MIcXec3LBXM-F7vtV093RbFyNgZhpZBOyUBnEk3IBfksR8qUXn-NbDoLxWJxgzWOg-ZDwUbd6VV7BW3eS1WzaK2pyCYTyry4brnABRFUZwxVZllcPsFskmMqc90KQw0yiRuu7H1udts7VjVKGF-OsFUlJSglpBDUsKlEOsims6adYzYe-2a7lxkG1vmYc2BsvWO96livtO0vEPsJMVVe-PFBh1lNUJYS4aDKc9J0EecUpqwOUVlwLc2Tm9eRfds71sZoxKfOPyusq6QSqLnUhWji7WKWzxEq40f3iBvuDxBteCu0ztt9jPhX7RWwQy6sc46qKL2DuBcpEgeVLCkkzhqUirAOqiJ_0bdzNZPmJtht7VjOObplxalOB2GdUlIoKVvpr_O9S9aZFkHd-QmBN_zR9lfsXeggFk338Kuu9cpbCN2NpSwKrA0Q_4tcesk8IlE6QqqIqioPdch58428aUv-tnYsIQQissRdCziptJJSeuGzORfdkKSxLxALh9ASrXUQvryxu5MIqIVDYJ2jKk0LvHg1HHzlLID2bh4xtOdeXc_atUPnq9YgJMaYa0C_Zu6049VQsLav_MqvRNicWFQCrEQIJYQ4AJkKOmkaRFB885zWL2dom2v0y2HOhN9HtXnVPv9Wi9bUHcLWt9qXpddXfClUts2LBhdEQV_C3I2w5z8_dls71gc_-EH6SyvsTYxwzmkBev8G4u9GUZxgbUWeTYO0tHwZzIaDdRrPX5PixnqZXrXP3lq9Pzjr9fKrsvI7TNBjvH4kXutf-KHqVZUjtXqRG6rABv7uePbKf7bb2rH-2T_7X9jZ28a4UlRVpS0impOJfOu3FcLLjlExGWxRZLO5rHStAfiiedL-HEu48IWGK_Oqb72SJsBY_7AWU5aY0ssTNGOPrvkCWhqFwg_7NqYEKqIouq7whXMCYx3GOabjV_6T3daO9R3f8RVcvbyNlKWsjFFYp-sE1I8_E4Cf4hFHjvHOJWyZ7YPKa_7fixFB2-ZaZM0bI4Xe_vbyxMVu5kk5qqqkLEofBuZlIECLF0F1W7-XEpUklGVOGkfEaXrdN3POenFVe-PKTp-L3daOtbubki7MsDIRSiklJB652MedVkgZsbi0wGh3gzKfIuRcmuxQz2hg9ZYYYWMCVNBGELfRgnSu0R1sfnW9p7I_f_nsCuU34zNBVVaUeU5VlBRZhrMGrVTIcQ8Wpeb6wA6QkUZFEaPBDkmS-E6CF3kzF0opN2PcyG3tWL_0S7_M6x4462lKWgXB5qaH1D8pqM32-n2MzRkOd4J2nBcQqYuDLjhTkWfMxhM_5-kQc0IgtZ_Yfjug7c7OZb68NIVtpKBtcBp74FE7k3AgXVDtDaUIa-3t4Wh1s7CxFHlOmecUeQbgUV2hWs2ftfjpvAXf4ZCxxoqC4d4GcXrtAIz9byZDKUUAg1f8493WjvXpT3-UN3zx12ExAi_QqeoAz887kkgxb1M_fvIoSRqFMGLuUPV93piK8e4uw53tBn1qmwtfpFQ6dLbe-gVYFjkXnj_P5uYmee6VmEQQ1xThs9daUm4u19IwSeq_m6Lg0oULXL161ZNeb7mDhXM2hjLLyaZTqrJASIGOY4T0TBop2o95SG-txUnHcLBOVY7pLfTn7TiHvFM958vdpMD4tma3f9M3vYM_-Pf_BtW_T1iBEkIGLRK3T6Gp5k70-316_S7XIof-YpZ5QTYaY42lKiviZN4SP-dfSHQUzeH2W5xjqUijI83z559HAgsLfRaWluj0eqSdDlpr31DtfOOffzichbIy5HnOcDBgZ2ebvMi55_77w13dvKxa3-fd6p3VGkxZUcwybFWh4xQZpMEPz4v9rmUdWFOyceV5kk5MlHTmknGi_Ta17sfN_Zy3tWPddddZPvFvf41zb70vCKdK6TXBuaaZr-b5KaUbBVv_B_-Pcw5TFriy8h31ZRnu_vXfa309gdDRtWqut8i01pw5e45jR44zGY8ZDHZZv7KOKUviOCZKUhaWlzh2_DibV9Z54fx5tNagpJ8uX1UopTh27ChHjx8nSmJfCr8NQBnrDHk2gaqinIXdWEqkVtcBL2odD69MvHv1Eha45_57Azwf5KcPOFb4qZmZfFO-t1t9cV_MdnefYFE-iJNCWBHgwFYItN880iClH_S2v6koTGI3YS6VtftyrHbbkRCfRUv7K2UN_iKIOylJp8Py0TXOVBVFnjMdT9je3mFne4eVlVWiJKG_vEySxPT7C3TSDlESk8QJSqt6ilCQXrlZPO_rmABT5owHO0T19yEFKtKoSL94Oz8CZ0o2Lz_L_Q89TLfXnWsxHtqd6kGLqqrQN0m7_bZ2rNNHenzTP_xJfvNd_7vAIWth58OspjlJpfcFdvOLLEPbvQ-VrDHNJPjaoer6mK2q249x4Zp-XbSOUDqi2-uzdvy4Hw4gBGmvy9ETxwPgUmcW9c2kNYPqdvhoQpBNx4wHe6z24yYv1AHduz4F1_dIWwerayscO3600ZTch-0ebBtqZK5fhdvZubrKM78NVDLAQk6CE4dDyF7GJIqToLA0LxL7dSYaki7WYqvS5yOt19c9O6bwbQu3fN9q0X72VRjCZ68HY4ugKDVfPCHXsnb-mQ8uvJsoBXboR7OWjYvnGe7uNGKoQiqSJPE544tGDf5LTXsLqCBpPa9dHv46aw1FWVCUBdnklb-z3NaO9czVZ_gn7_nvMTgpQDmEckEnwQ90a02gB6wTKBX5XqwD6rhQ51Be36IqC5yxcyi3VsW1ltl4QJlPbz1y0bL6RlIL0tAirtads02-WKsthb978skcMwy44i0MeSVFNmX3yiXSSDc3EBVp4qQTEMHDz609zjuKEoTSAQ1si32GPNzNGymNdWSzgiwrGE13b8InvI2tIwUPLGkERgRVRkXjWO1ioV8o1ggQUXMHvGZXaxzNV_xtGNcTpFWpNam3r15m49JzXi_wtoibOPTztJWQXkwN6Rru6U3UfjjMhLPsbVxGm4LlhYXm3HUcE93IjhWGr-so8U54gJQ9_8BzZSlrHWVpKEtzrUDoK2C3tWMtr61xz-sf8GpjCIVzHle-zmI31nm99UP-1qjNCt8aYow5MLgstMIJ0JRceubTZOO9z4s4yy2z1hqbj2u91Z_HURUzNl44T6-XUk8RVkqSdjrIBrg4_Duu2_iNsSE6uUEVLuuoKkN1A20pnw-7rR0rVhn9eIjwQ40iF8CWw_TqHJ4dvV8taf-drN0K4oydAxgH5lUoKRhuX-GFZx7HmvKQr_gW72K32jc-C5tDSZKtKy8w2LyEqwpm-cxPHnOWpJMiVZCIE4cXcpuw31ivo_gijtVuyDfWUpmaPf_K223tWEURsbdTIZxQgHbWaZwThAR9nzl85f6Q49SRj5CKbDbzDhUGgLdr8XX0sLiwwKkTa2xcfoq9nSv7C44toa9X7cat1uctiymXnn2cbLjBxQtPY6qcypSMZ1N0EmhJL6Vg7Bx5kft6HeIl9SNFYGrYylCZ6qYocN22juWcQ5gMaTPhcMo6p621UVUUYrS3S57NDsCpYKrK8-rq8LpN7QkCJHleUJWeTV0VxVz6uzH_H5GSaFdx4clPU-VZW87yVbf6bMx53PbqxafJh1c5fnyFhX6HThKTzzJ6vT5JGhC-9l3u0GM5iiy_oWEy9Z-tsdZYZ4yxOPPKa0zfto4F4LQj6UnhQFtjY1OZKJvNxHgwwBSFR8JaunRlVbbaAhq2ZhNR6Cgi7XYpqwqso8zLsPPNsSaBbw83laUTRYw2r7Bx8TlfYG7o7rcPoHEnmC93OKZ7G1x88lGSyH9vZWWQUlIZw_LaGiqK5vrx7de2TAR-oXPGjz11L_3ezoFFZMYxriyoJHnFP_Pt7Vg5yDIRAh8KWmt0VZTClJUv4jaiB-H5oX7jIWY3v6oAeKJub3GRKuRWVVlijGnaCTxd12KMwViLVo5eYrjy7GNMh9t-7i3y1T3rZZrAYcsZzz3-UdxsjyTS4CzGlFjniDodFldXcVLO212Yk6drbn-YEU4-m2HK0rNJQhNjIxtf80dFu-ovkFJdstZdAeiy8op_5tvWsYQQdFcWmNgC53sGlDNO2dIIU1U-7HMHGxEdzhiaHuzm12Fnk4J0oe-_sMpQFTlVUWsstI9iQ83HkkQCm-_xwtOfoiqzQAu68YFur1oIAS88xe6lZ-mlcRj27W9eZVWxtLpC0u0eFmS0Bv6EI1UV48GAMs-bQd37JmEephnvIIr0By5cvLIppGSl_8c4FHzHO95BJEskuQCUEEIbZ7WxVljrPPAQmAXN9XOGbDbzbOm8YGd7h4sXL3PlygaD3QEmr-h0F4jShMpUuKr0-dO-GUui6Wmqd7xOJNi9_BQXn_4EwhoPXb_qXC9pLuxW090Nrjz1KRbTCB2K99b6yAApOXryBELLA850bWnAOUeez5gMBlgTWvjnQvKHn4TftHId6Q__l_-v7y3Tbp-3fs8PvuKf_bZ1rHe-851sDXeQkaczCSGUtShjnbDWUhUV1th5CABIqbxDbW3z7LPPszessPSZ5YrnX9jg0088xWQ8Jk4SitLP6S2LrOGP7Rs9Y5kr0glHqgwXn3yUrUvPIhvWw62-Sre3CRzlbMj5xx9BllPiWDeMCGMspXUsrq3SW14KI5NqpsThTmLKkslgwHQ0RErRCvvCEw5O9wwiNc65DMGV0fYebuHmhPG3LQk3juOwkYSLLaWfuuQVZCjzgiovgzhnQPJ0xO7mHtPyCqfufZiTZx9AqwhnLXkxZmv9ApcuP4OsLGVRefg1L3z4GPh2Qio_OLqomkkmIIh0RNdWnH_sQyRpl6UjJ2-JdPGdYC5ko9iKS898muHVCyz1UpydT3iczXLysuT42bPIOAnKtnPm-cFoHucopjNmwzFlnhN1U88JvSZs9P9ljGFzc5N-v4_W2piqKkoh-dIvuTns9tt2xyrLMkxYr0M01WhVCCGoyiq0cs_HZyZph0lmOHXX6zh19rUImWCdBBGRpMucufshzt7zOrLcMJtMqcqSsijCLFt_KCkEWul9UH5dq-wmETIf8fTH389suI0QtlUHcweTgz821gClroWaOsPGC89w-dlP00vjawrxs9mM7uIiS6trIGRoupwfzx14A1tWTIcjqizDVAYdxXNWexh20B7cPZ1O2dnehhB2TqYzsizj3e964aZck9vWsb7ru76LpaUjlKULuvaCNlbhjCGfZU1flbOOrLCcufchTt71IE7qfURcXxSMOXLyPk6ce5DJrCCb-S_JVIZaOl9KidKqlWfN39Q5QbeTUI02efrjH2A22EbW2hK2Tfr44-Fdtd4GjdOAEw5Xzbjy7OM8_egfkSqH1BqLwwiwUlBZS-Us977mAZJeb1_Bdn8BPhzXWrLxmNlwgC09xzOKkuDD86Hsdfu9tZad7W263S5JkmCMZTKZMZ1mDGTvplyb29axfu3Xfo1s5BBVbHFy5hCFq6f3ON8YNxtPKaYZzlim0xmTzHLq3GuQKvEaCUHGbI4SCSDl1F0Ps7x2ktHuLqYsKPI89Cv5DlYVFoIL83Qb-DcsoH4_Zbpzkcc_8PvsXHkOTIVA4ZAIK16MzviFZQ0RWmDDCNN8tMVTj7yXpz_-frrakkTSa-sL1xTisyKnv7LC8bNncEo2G529DqulKgrGOzuUsylFkXtme1yLxzh_7JZ7Tadjhru7LC8tISRY61xeGJsVJdHGq5QmbFWRRLEVUo6FkNtALpVyQggPPOQzpqMhtjIM9sb0F4-yuHw0CKgczGTnbQVxZ4FTd7-GWV6QTycUNc0J_xSp9aFqRvXkQQH0ewl2tsNjH_w9nnv8IxTZqNEwbFbQ_Nu-5WpPnzdrUeUDquThBlOwfelpPvGHv8XWhSdY6sdEsca6unQxt1mec-rucyS9MEq66Wa-tivcmorJYJfpcIA1vnNaSoXSGqHkfjpomK-1vbFJmqR0-71A2DVFlhez6SzHuMlNuUy3rWM55zA6wp180KHkBMF5h3hK67jQOgoD4kpGgz3GgyGDwYzl1ZNIFb8I1cUH5EJKjp65m8XVY0xGI_LpBFtWzYBcrXVTaN5vofs4dOP2uikLsePq04_y-Id-n-315zC2CNLI81bCA9_9HbiZHSwtzIf-CWeY7K7z1Mfex2c-9G5kPmZlcREt1b4ZV3WzaV4U9JYWOHb65HUbFOdz0i35dMJ4dwdT5jhrKYqCOEm8Nobcr-PvjGEyGDLc2-PI0aMopfxOaO16nhcbeZbjLg5vyhW7bR1LCEH5gX-OfOHjRHo1F05cKsvqE0LIzSSOffuadRSzGVvrV6kqR39xdT7tfV97Pq0vzjcKJr0Fjp4-h3OCyWhMPps17etxmswr-vvPCmMqRuOhbzlxlkhLFnsxxeAyj3_gt3jq43_AeLAOFE2nK3dyzavdWehEAAoswlXk411eeOJRPvWB32H7hc-w3FF0O0mre9nt262ctRRVyem77yLudOZd3te8ndc5tnnGeGuLYjLBGeM7DZwlSuL5mNW6m9pa8ixna_0qnTRhYWkx-JxFSD6ysz24ioM3fuXrbsplu20dC-DYn_5RRPcEevP_dCqKR2VVPQl8JIqiilrM0pSMR0OiKCGO0xfRqphTm5yQCBWTLqxw5ORJZuMx-WTieYbOkXQ6QUT_2sZCZw2T8QhTFoiweKxzdNKIxQQGl57gMx_6Hc4__hGme1dxLgfpsKJWrGjPOr4DqFEtUR6PvFlsMWXjwhN88n2_xcXHPkTqZiz1U4Ssr5l3KMd-wZ4sm7G4vMzK0SMg9yOB7edJ53BlwXR7h-nOHrbw0cRkOsUFDUmh9le7qqJguLPNZDRm7chRVCS93zpXCOf-6M_-599WODJe-x1__aZcttvasb7qq76B1A4xS29j6fTZMi-rS8aa3yrK_OksmzVCKThHf2EJqaMm3Ns3_btlDTivNOiI1eMniDspo8EAW1bYsGMprZpGSNd6sRACawzWVPtCJIdDKkW3k6LNjK1nH-PTH_p9zj_2USZ7W6F9fn4wVwtscJvEhteNURsyEaaYsXX5WT7zyB_w3Cc-iCgGLC7ERFq0clLvUAf36LIscUJw5r57kEkSdqsDQ__CgG9XlcwGQ4bb26EDwQVkb0qSJDjhZe7COGpsWTLdG7B7dZNet8fC0nKLKy2mDnF-cHGD3erDN-1y3rYF4tr2bJ_XHlvkA7_7a050u-MsLz7ZjaL3lEV-ThJ3lVZgHVEch2EJNa50eBfqnF0BUkmiTpcTZ8_xwvPPM51MWEiXUEFg3-TFNUeRUhJrDbZVtmkhE85alAQZOapiwNVnPsnWpfMcPXs_R8_cQ3dhCVTUzFsQrV3rVm1g-xy-VZIKwsyYPGNva52NF55mtLWOpKSbSAQenJh3_B5-h3DOMctzzt57N72lxXkIeFAuwFmcMRTjCYONTV9OCWWPbDpFWEcaogmltL9_VobZYMRwY4tsNuPk3Xeh4sg7twNrxLTIzZ4zBb_5I--6aV2it_WOBfBn_syfYW9wif6RIzz57EY5y2YbiytLH-svL7wwmU4aKTPR3AGZ71rXsfovUnmmxfLRo3QXFtjauArOISNNd6HfIIBtkRafNPvpgU3-1NRyXOPPZTZjOh6w0FGkZGw99yk-_cHf4_nHH2G6t4Gw5QGevGvI-uYm5WTXZqBz1VjpLMVswNbFp3jikffw1KPvYbJ9nm5kSCMJWPYGuwz39q6vUBguyXQ6ZXFlmeNnziBqXfx9PXNh4IOpKEZjdq6sMxuNvdiP9TSM2WRKr9_3DA2piHSEcJZ8MmG4tc1wd4-llRUWlpbCJ1A45yiKYmO4O9wa7A34bz92_CZc1bC2bto7fQ72pd_4_aQLz_Dj_-AX3XA0GFnBC8fPnL6o48jlWeYXuWhB3LXt-77FgV-FKYDCIbTmzF13UZQFm-vrAHQX-1SH6QsGJGv_3_az7F2ohxV5gTEVSgk6iSSyEzaee4zPfOg9nH_8Iwx316lMFhgDc3BF3qQo0XfAz28dXt3KkY13uPD4R3n09_89T3z4PWTbF-lrRyfWDesf5xo14eultULga4RCcObee1BpEt6j9V3Vm521ZKMJO5evMhuMfOtOmLBSZBnOQafbwzmH0hqtNWWWMdzaZrw7wAEnzpxGatUUmY1xZLPskQvnL2zs7uyysrLxCl7N_XZHOJZSit7Zv8C7f_Wvs76-XeR5vt1fWVo_fe_d1azImUynh6sOHWgpaVvNkK_jwt7iImfOnuPqpcsMdvbo9Ho44bUSDprWGmMqXmxfieIYJRVlXmCdwboKpRy9VKLtmKvPPc6n3v-7fOaj72V7_TymnCJEmKErxCFn_EpY0PPDYm3OdLzJxSc_zuN_9NtceOxDyGLAUkfTiVVo9WiuHjhDVZWhPf5wq8qSrMg5d_-9dFeWcGo-cXEu7e0jjmwwYvvSFaaDEdY6jHXNpJXJaES32w3cQEEURThj2L66wXB7l-FgwNFTJ-ksLrQ6FCxFlpvpaPyxd_w_viOf7N0cmL222z7Hqm1JfYanB1Mubwzt3u5g2lta2Fs7fqzc3dyMtp66EKSD205wQKgixFlefVr4cTiVafjUCFhZW2M6mfL8s-c5d-4s6UKffJLR7Xb3LXIdRRSZj_85TGM8QME6isjznLibNk39DotUgoVOhKkM080LPL29QWdpjdUTZ1g9cYakuxCmndC6rX_-zTcgZox2r3LxuScZbF1B2ZxUC7rLvXlh27rWaImg5BgGMCitDk1nnbVMZzPO3ns3x86cBj2Xja6ZLM46qiJnvDtgtLVNMZ56Z6q_K-eYjidUxpL2ul7RSQg0ksHmNtPRmNFoRG9pkaOnT-FkGN_k_HTI0e6g2tnY2hPvf4RJ4A3eLLtjHOvNbzvNsx-4zNIibv3S1erI0SNZb7FfnbnrbnZ2ps0ghLlOYL0SLKYoqPIcYwwq0iSdLtYYTFV5twohEEJw_NQpKmO4fOkKOChmOd200ziQcBApHbqMDUq1hoCL_UXOKE0YD4b0rAsKUWH1WY-bKSnpJR4A2Ln4LHvr62wfvUR3ZY21E6dZWF5Fx_Hndeeq5beLbMbe1SvsbFxi-8rzDLaucOroGkka-eJ4cCaEVxjGgROhO1vgQYsQTVxzftYxmUw4evI4J-46hwiSZm1uoTOGbDJlsL3FZG_oIfVAK3NhwJ4zhslkwsLiIlIpbHDt6WiEMV50VUaaux58AJ3WUmpegSsbzRjvjtnbm6HlmKp6ddrIdSzDWE3aPesuX3iqOn3qeJmmiY3ihE6vB6od1QqEc5iiIB-PqKYTbFX5tgUlsb0elckosylSrs5VcPH51qm7ztHr9Xj2059hd2-XNE1Iu91GgjpSCgmYqvQ6DdfZV6I4xjhLVZbEqdo3esgXjQ04gxSKfjdmZfU4C4ur7IyHPPPJDZLeAmvHT7K8doy010cqOYeRQzHMcXAAdmgvbOM3dQXC-bBqd-Mqe5tXKKcjFnopR5cWEdmAONLz3rRaNbgOePdN8BBY40IngArHJijOGibjMavHj3HugftRsS_mChscxljKPGc8GDLa2yOfzsD4CTCupe4rHEwmE5TWpJ3OfBpMkFSojCGrSu57-CG6y0vY1lSZfJox3h0wHGbDSvQubezM6N79xpu6Wu8gx_oMd528h7f-uR-w_-rHv296-eJ6vri05NJOx09grIceiBDi5Dmz3R2q2RThKsJUBWxlKMd77O5eJR8PsMUxbBwhdT0a1e88S0fWeOhNX0Qv7bB95QqVtXTSFK0EKlJorSjyjKTTbZC0MAylKYwqpYjihOlsdt35uC6MpBGuospzkqTDibTLalUynkzYOv8s6889x-LqEY6eOkV_eRkVxYEZIvcj1q7umBVIO68t2DJnuLPLzsYGuxvraCwry4v01s4Sacn6C88inMU5E3ZmN3eoa87XW1lWOCeQTiKsz9YqUzIejzl66iR3v-YBdJp4ZynK0OaTMx1PPY1sNsUZL41tbcjfxPxKlkXOZDpheXnZj_Rpz1tyMM1zztx_DyvHj_lzDr-v8pLJ3oDtrYGZluqdp-57-KPlbMTjv_3LN3W13jGOJcRP4pzjXZPL9FfXtvauXLiyfnnTnDx5LIy_DFN-hMWVJdlgj2o6RrmaXBtCFyGgKhlurZNPh2xdukRnoUd3oU8UOGiEBuIojrnvoQdZO7LKlQsvsDfYA1ORxgnGVJTTkoWl5bmo_742ce-gabfDcDjEGINs76qCVi0LMIYqzz2_TkoiFbG6tMLy4jLZLGMw2uPZT1wl6nRYOnKU1WMn6fQXEDJqCqWNTmlg5pezKYOdLbavXGKyu0cv7XD26BHiJG4Y4YRit5IOhA2Y5OHmWp3TRV6igxKtwJHlGaPxmOMnT3Dy1CmKPGeWzaiqiiLLKGYZRV5igvScs_OBFM1xbZhv5Sx7uzukSUSSRP5GGZ5irGM8nXD07GlOnDsLrV3cFgXj7V0213fs3tT-cm_l9H978elPDv_R3_3b_MjP_Tr8f37ppq3XO8axAMzWJ_iWP_8X-bV_8c_yI6fv--DuaHdHyc0j2XTmgaowmKycTKimE4Sz9fr29aGqYpZlDAa77A4nxHGXK-vbxNu7LCx0iZPYDz1rkmw_NbAqSnr9PlIIssmYqigYDAY4Zzly7ARoOR-ZE-CQWvUpSRKUUkynU_r9_iGYip-VXDlHUeX7hKVccNZep0uv26UoS0aTCcMrl9lbv0LS7ZP0Fuh0e0RJhFS-vlYVJbPJiNHWJibPWVzos3b6FEkcz6ePUNfgLFVVtHLA1la3z0QTYgsH1hjSNAYsg8GIbDajv7SIEJIrly7Np6Q4X9aoa1r1HGRaBRARurQ9cdkyGg7BOXoLi9gwdtoBRVEyyTOOnzvDuQceQEZRU0u0ecFoe5fN9W23Pcr_LenqD19-_jMvfMdf_nG-_Ku_maOvfdNNXat3jGO1Wzje9qf-I9aOn37y0ff_5ofOP_up1xRZWRPTMXlJPp16p5JQlYbpdMpwPGKW5cg4Ye34Wd788BehI81ktMP25fPsXb1AN1GB2T7vdvWFYH8f11KysLCArUq2tzYoi5KiyEm0nvP-DkwTlFLQ6aSMRmO6nS5SB5AlwMIucAiNg6IK2oUt7kgz58l5mH95eZnlpUU_jibLmW6ts5dlTCZTyqokThJ6vS69Tpe1fp_0yFGP3DGfkRU-nHcQ6_w8ZiWaKSWHaU64VjHbWuOlyyrJ1uZVnIOVlRWiJKEsCg8GCRGYJPMe-6qqMNYSRVHDl2y32gjhO4vH4xGrq6tIpb0qrhDMZhm5Mdz14AOcvOsuhA76GdZS5gXjrS12tgfsDLI_LGX6t8aXzz_3jr_41zj_8fdxz5vfftPX6x3jWLXt7hW4zgn-m-98ePrX__ff-sTm-mXbXZBSJx0fAhU5tszJshmTyZjhaIRB0V9Z5dx9x1hcWSFKu2GkjyVdWmXl-GkuPdHj0pOfYLGfIORcp05SD4S0SOFh3PUrV6isYXl1lWw6I-ke3pXqncKSpil7ewMmswkL_YXgVPPnOfyuRc1IaFn7htL06QpBHCckccLK0qLfdYoKawwqipAq7Lo16nCdCm7N4C8r25o4v49rsr8rIEDtRZGzsb6ONRXHjh9jde0ISkms9QwYJ8OxjcXaClP5xT-dTen0-0Ra___be_M4u9KzvvP7vmc_99y16tYiVWnpltR7u914wTbeIEDsABlCYkwWwgwhTDb4OAshCZlkQojJBAYShgQYJiSYGAiGmQlLwmZjvIwNtttLu7vV3eqW1FpKtdddz_q-88c599x7SyWppC5JTfDTn9slqe455z3nvM_7Psvv-T1F2cnEuAQkSczmxgbVes6klWlNkiREcYwdBNx38iTNdjt_Tpo8-tfr0d3corO1zep2tJLIynvPPPHRZ77q3X-TM09-kkff9A13ZZ7-kVCsyclVqVhm5rX99_7Ouvfcpz7Ubs0tiZP33Y_j1-h3u6xdvMDm6mUyrWjMtFlePk6lVsd2PaQ0SgxZmUtBYFgVlu97jHgwYO38aaqBN0VRnZsbGYNBn62tTaIowq9UCGo1ejtdqmmK2JUoFWWkUWAYBvV6nX5_QMULynadkyQoQhhIy7nGfrE3plhrXRpupm0h9ERo_uo_7JL8ZKlSxGmM6xTUmHqk3GLPsWgh6Ox08H0P13EIhyFnzpwhLnoi-0EFr1LFMAySOCKOQoQWuK5DLQiwXHccyi8pwCFJE9ZWV3EcG9Mw6Xa7pFpjuS6Hjh5hfnkZy_fzdHaSEYdDBp0ug50d4mHI-naUarf1H1_9pq_73UP3Pshge51Xf_W779qc_SOhWABJliClIbMsahtCPZr0Ow93trffUa02xWCQ8dK50yRxiGVK5o_fQ73Vwq0EYz4FXZQ0jNrajBigdPExfRaOnGL9pbPEwwjXc0r7P45DtjbXiaKQer2O53qoIkrY2d4hCkP8oDoRHdRFsaMsiyODoJJ3sO92aDVaOU8GlEEXKSxs2yvUcdRNcowm3BOgK8ZrvtDXVqHdqYCyMSRF53pRKLaWE54PEzvKiNRHkiYxq6tXyOIIe3YWx_PQUuL5FSqVSt6R0TRzpL_rIkQN0zAxDIOSVQ5NEsdowHVchuGAcy--mEcU2236gwG1Zueu-l8AAFW-SURBVJOl5WUa7Ta254LKiDpdkjTPf_V7ObGMUJp-pJGVmU8sn3zsJy48--no7NNP8qZv-s672sD8Fa9Y-u1vB2DQWaFSbVsGyZxI49deOXfuT5898-J9tVpAozek1qizdGyZIKjku8eofHxXjkejkbpobTCJLEfgV-rMzh1m9aVnsQzBYDggioakaYJtW7RaiyRJSq-3RXt2Ftuy8YIK3W4H3w9GFkrhhOuSXUoJ0NLEacyxsrnFcJhR8ysYYtTG1GRgGjiVKokpMVWGoXXR_LVED5Y7iC5HzNSfdpOxTWPOdZGbEqiia0QmYKAseoaX-1gyT5TLEamzVvlnojVSGEV4roewbXqDAXPz88zMtnFsN-9iNpn7YtzSVhRojCRJ6Pd6hFFEtVplOOizvbWFUhme51Gr1ag3mhi2TRTFXLl0uWzcrQsUiM7yxUoAmTYYJFZYnz_8s__jl7_57O-FCQ-87q24tbm7Om9fsZV2K8-dZv7EKZ791MdZuXSBztYGX_eX_5qx8uJTS-sXL7x1e339613PecvSkeW5RquFWUBmSvCquImbGwUrhl22zz_Pc5__BDrtk-k88mXZJlJKut0uL730EkFQpV6rMwwjtra2EFJy9Ng9-H6AEhItDCIMhlqwkym2M8FAW4RYbIYRwzhmptFASkGWJiCMvAmD47DcbDLn2tQtk6plEEhBXi89sSUJmSMfypKN0X2M0X-TuSihBakh6CHZjjWdVBFlmmGWsbKzzQsvnSVwLXzbwBQKWwocQ-AKjSsUFanwZa5oW6sr1G3JbDWgO-zT7XaJkxTbsnFdF9u2MU2r7EWmVEaWJkRRxHA4JMsyXNfFMIwc4wm0Wi0816XX69HtdQmCKkG1BlIWa9-oBH9UbFnkDIUkTDR96heOP_zl35DEwyfahxapLd1_t6fvK3PH-tX3_5_4QZUf-l--mz_3rv_Rz7JsQWtqf_AbH3CPHjs6v3x44ZET9x67z7adWsnbUlKVTa_e-xKdh8jSLMN2fVqz83Q2LtAIPJI0ZWNzlSiKkFISBAFKKc6dP8fm5hYLCws05uZZHQyZrdQYYLCSWqykJhvKoGN5DP0q2grQlksqTYRhsFFEu0aYOaEydBbzTJbgdRKcbEhDZ7QlzHs2i77LjGNBmhL2uoRhCCrDs0ya9RqeY0-RVXaHQzIJtuOA6fDCIOYzGx1WlU1keaTCIEYQmU3UPTMT3lSG0BmGSjF0hp1GeHEPX4WY4QA383mkWmFgpHhBDc8PSJKEXrfLpUuXSZKE1kwrT_4KgePYpUlm2zZKKeIkRiSCWrVKJajmwRagVm_gOC6dTofVwQqu5-K4HsIwsYqFUxWwqCxTpKlivRsRLMwNW_OHu3E4IFi8525PX3glKtav_fJP88__zb9mttHinnvvP_r86Se_x7HMt588daK2uLBgVoKKJ02jAhjTgelbLBQc7QIqxxQqBbXaDFurL-VRNilp1JogcyRFmmZ0ez1M26E9v4i2HfTMYZ5Z7dPfEvQrNbbsFmmthXI8MtclM0zAKGnCRrtIvr_oEn4khCLSmr7WSJ2xkcacD0NkOKDaH1KL1qmlCY8fO87CoSYbK1f4_PPP0N7u8uiJ41hS0o9Tvvjs83STBLdaQ7k-K9rg6VSwFcyggyaYNpmAbEQ2Ksam5ohILPcBNVIrZJZAHMKggzvYZivushD3WDISZq2I_s4qm6urVIMas5UKrmOTJll-DkOQJDHdbpeoMP9q9Tqe52GYYziYLp6G43rM2A6dbocra6sYlkWjOUOaJkRhiG3bebheafphwnpPMXuq1fdqrQTTQqhbmAO3QV5RirVz5gy1I4scnV3i0uXLi0sLc-9tz7W_uT3blp7rYkg55mfc7Zm-DKNWCNBpiopCUArH9YnjjEsXL1ENKmRaEcVx3ldLSBzfo724SFcZPLk14HLf5kJtjrjeRjbm0E4FpJnnwcr2QNMAXUER3BD571WhXFnRvFwISWpbCKeCqWcY6oz1QQdna4NDwQy1-gznn79A_diD9LavcLkzYK5R4_TlFc4PEw4fP8XDj7-Gz1y8xKdOv8Bg7hCZX0EjyQqOxKndfhK5Xk7zgoHYNJCmh-E3ydQSL8Uhq4MeZzorLERXWLBDqg0FWczO9jbbmSIOIwRQb9QRRt6m1nVdhJT0BwMGwxCjyHcpAUrrPMAhJUiJkpJjDz3EoaUjVIKAaDgkCgcYUpJFOYf7lc3usO4a55Rh_34GvUyDKLCbd1teMYr127_1W9g-bF14kebMrLOwuPDXfd_9s67nSlHmYkThROziSYBdLvv4N1eVvo9iCoy_rpOUdDAgKyBFhmFSrdYxRIbl2JhaYbs5V7hl2wjTIEFycSD4LC2i-VPo-gLacEjFqOZosnfXNJIhdxs0mlHP5BGSfPqussKvyiCHOVUbZLbDr79wlj988kkemWkz35zDtGzObV9iI0pZjeHoo69lrdPn4-cu8blOl-HCYWLHJysYlrTYtbtPjqF4ULurgrXWpEAqBLHjETsV4nqL7mCR1a3znHQv87ATUctipMpJOTc3N7N2ux3btuXlucG8Bi5O855kppnzVkRpipKCaqOBXw1wfZ9KUMWrVvMksdLYrovVN9nZ2qbX7ROGycZQm5-utuY-2ul0Pjbsd3uDXvduT-NSXhGK9cwzn2Pe9YiTjDCJ5ezszLsMKb5TSF0sP7oMLY9qdYTIY2QF_3SRC6Ls21IeN1EDXrY5VSovJ0lT0jgmGXRRwz46S_MO7tKkXp8hi4cE1QpqRI6i83BxBkTC4qVYMpw7jmgtkY6SvIyQ65OxsVyuIvq6uo3TVVIuHDofdmq7iEaLC4M-pzyfREhE0ODC-gqdjQ0evPc-pOUztFI--LkvkC4fQVd80oIHUE-FScUUt2i56OzRuHJcoJ3_Y6IVmTSQwSyJGzBcMdD9czxegUqW4dk-dZ3pze2t9dmZ1iFDmAZoTNvCcpw8oSAFrufRrlRwKj5uEGDYFnLkT2UZSRgRRzGDbpfezjZxGKGVuNIL09_PzMpvNhqzn7i8vn3Oss2o39-621O5lFeEYql-j6EQnL-0JR574Mj_IA2-X6HaQueg2Sk6faVYv7KCUIp6o14UtuWNuw3TQEhjggtck6mYTKVkaUIyHBIPhqRhSBTmYXSV5ogFoRU6S1Fpgo5DdjbXGA6GuFUPIUc0yqMSCslWGHOhJ-DwLEqYE8laNb2Hlsoudk3qvWWynCyJE8LBgCxNkSKnvnY8F9cLUDPznOmHKOmw3tnk2W6PJFUEieYIJgPLJW61UUEzp76eQO6PLlRiFa9ioir-Jgpl1BMJ3VF5jdAoRG5WWjbmwkmevzigEV_ilAkOUKkGZpJlamNrc3OmNdOWhsx7RMvcr9OKgho8RG5vYzsOlmvjOC4gieOYNE5Ii59ohYHY7kfpxzZ74a8GC4c-4tVqF5zVML2ychbDeEVMZ3glKNZv__IH6Gzv8MDjb8SvnHmbkOIHEeroyM6fTG6OCu8s0-Tsc8-zdkFQr1VxbQfDNMmERAuJKjjskiSh2-0QxXFerqU10pA4loVlWjiuh-26mI6Tl32rlCyO6Hc6KM8nuvQiW50-jXoOWdJFg4V4GDLYGdDwD9GTkohpVml2KxXsi2O6SNMAEEch_c4OSRjmUUMBQgri2EfUG9jVBl9cWeGZzkuYFQd95BhSw2eGIedW19hSmqTWQBsSspQ0yckuDcvCKLCN0_tpMUwxzXc4ykJNGbWTyPyiPis0PfrNI5w-8xIB2zQMsG0Ly7Hmtrc2z6Vp6s_Pz1eEYRS1W2J0MGR56UiYpDnzrSwCO1oXCfwiuCNFHCfp59e3B78jvMbHlpfufWl163LWOuJx7uwnOXrfO-_2dC7lritWpVZhafkQZ5_6zEy7VX8PQp9kVN2ud6c-c2nO5qUPl86dZXVtDaEVaZKihcR0XYRhYFgmfiWgPT-P4_m4vo9p2wUCQCClUdRvjVOucjRhdF7DtH5ugeef-DjdnS5BvQpAFEVsbK7TrLY47FS4EA53BVOuWgr2JZrRhM5RCZ2dHdJwmHczQYJWKKWJwiFD20FWqxgL8_m_WxZZcR-9qmJ9a4dIZziuSzwcEg76JFGERmOaFl4QYLv-1S1Fry6E3nOco1srJzyQoEmcKlbQxs1SsrBDfzDAME1v-eixxSgMz69vbB2pN5sVy7ImYGqi9O9K-Fg22XMkR8ZLaZCk2aWN7cEnsIM_WLznvgsrl5_LXn_PO7nSP8_Rr7x78KW95K4r1s76Fu0ve5hut_8awzC-QoxjZsjrrPKVao0TDz5MEsdEgyG9Xg_TsakENSynUCApShQ55Qo9HY8dkX6W3XeKrUZries3uPe-V_HC6c8SF3VEm9tbVCoB1WpAW2W40Q5xtggFn_wthyeL8amC6isJowmY0jgRrJQmiiOczMU0LTSQFKy6AkGIQLSaOEozHAwY9HpkSVKUZkBUNC6vGQam7Vyze-J1h6rH72ZqJ9MK15A0vCpO1Sl8YYlj2_V6s6UNa-P89s72UqVSqbquixyZ-QVBY27Si6LGa8warNEMB8N0s9N_Ttu1J-ozCy-ET38wNo69jRc3TvPAV_3JOz5vbyR3VbH-5rd_OwvLi_zCB_6r8aff-favlFI0marF3ZuoRReNxhAGllvBcgOCmbkpDI8oONqnnfCrAwYjb0zo3QHxvLjOqzaZWzzCc6c_jdCKWrNJUK0gtKYtE-biDv2oT2Y1criNYKr042YljiLCwRChpiOFJXGzEAhDooXI6cEmsBaUIJJ8OxnxekzQK-UojDRl2B8QmNYEac1Y9DXQ8GJqV554H0V1thFHOCrJ_cxRFFdpwjAkjKKG53syzdIXtje3aqFtH_Fc17BtB8OwEMIg0wqVZgVJJ5FWqqeyNIoTpbuDaDXRxocD339ic2WzU6mf4sHXnmJx_vE7N2FvQu6qYn36k6f5G3_N4tWPnJo3pXjriHHuRuDJ6VTWqB5dT5b-TOwd-obkneUE3s0doUFpSaXaREqbatWlWqujdYZGERBxr2lzpb9F5ldJGFcS66tPuOe1yz8LUJnKm-GprOScmByakAau6-L6fg73mcIOTqDxyXcKz6uQxAnRcDB9Na2Jo5A4cnA9f7rxm76xL3jVXRT1albYpy4zTMG4bVLRN0trSJKk5rruve12-79ub2398sbq5uvjMF7ygpoT1JsCw4i1EBuZUp9NkvijSZY9L4ToG5arWocPDWYXlq7M1Be6H_zEr6lv-If_iPf-7J-4ndPzZcnd3bG-51tp1Gr0h8NjhjSOjxkcbvxyBZO1S2ocPZgEC3LjoEH5-ifnnSgovwpeO8fxabXm0SLKAbWFoWKRcczKeDHcYjiooypNptjed1mGaqp7iZ7S5tGEdj2XnD0gZ5XSBSuSZZrYrotfEOekaYbOcozeKBWRrzMalSZ57yjLxA2qKK1I4ggmWhNlaUYSRzieuytFsR8RE-DaPAhhpUOqgzVmzXQcctKjpn-TiTMVWLb9-tn23I9cidd-sBemc4EXeNXZBeHXm5Hr-VuNmbn1X_x3_zxaOHaqKJpMiwaBQ3Z2NqjMDVj_-Y8w--Y7X8C4X7mritWsz9FqtjCMbts0jGC_x4k9yTnHKOrJv99IRh7d9F6nUSrNyVW0RgoT26kwCOM8mlb2htK4yYBaL0UnJnK5gnbyAr2rzrirJZDenSgq7stxXWzHQalsXMIuNYY0chOQcT6vu7WJIw0q9TrSsnLIVRiyevkSrbl5LL-C5TkEZpOo32c46KPTtKAy0xMVxTfjG44LSvLRSEwhcAYdZuMdZnyF1BrFZFM4kfeyApQ2GAyijV5_sG06zoZWOxtpEpMmMVkSoyyL7fUV3vaNf4lTxl_m9-IfodqqcsicZy4GXvsw94hvAv7t7ZuYByB3VbGWF2awmw38JGlLKawCY3BHReya4LoIAadxWLRAzR1qLQyubPQwuzk6I0vyru_SC6g5Ld58fJZP9Tfom22UzPPaU8ol9L7BjELkpP8F8euYKlOPa8kcw8SyLNTKKtVoiHIcQiFYuXKFnV6Pxky7DMQYlk2lamBaNmG_n-fvlCo6hKgpU3Dfz41RnktgZAl6Y5UGClPmfpzUV6dKoiSmN0ie6ofJ_zoY8KxtSV711TV89Ub8YJ5608GqHIFhH3HyAQDewnvu-Jw4CLlrihX-g-_kJVPwu7_-68abXvvaB9HKGpnmU_x7Byx7oSCmzDOt0UlENhyASovaKoFfneHhN5_EbTS5cvYcp7_4eZoLbe598CFeWlnj2EMnqK3u8KFL23SDJslEsnK0uzENHLq5ARcml9YiR52kKWJ7i9fNzXK02WB70GclDNnqdOiiyLK0iMoVlHDSwPMq2I5LliakScyuPf6aMv0upuFOUivk9ib3VH1maXHlygs0TUHF98rweZYphlGY9cL4g8Jwf-D-177xI2c--0k16HTpBU_wwOt-6ra867spd02xnPf-JO6f_w7uPXpsTqC_XGhVrsa3U6YzTJNAVAVphkoiou4OaTiY7sAhJW5QY5gJBtrksTe9nSPHj4MUbHZD_DThK48vozLJB1c26FZnUIZRMlnKYufJbgmCPy7aFCJvzJZ0O4jONgvtNodsi0N2jcOqxsrGOludTs7RgSgTzqMAjWEYGIaB47g56EqKkmxzzytfY4ErUSTDAYd1wp953WupJ9t8-kPbdJI-3c0ONdcmU5BJEy-Y-XCrYX33x3_3V5-utWaxbI_lN9o8_ro717PqTspdU6xP_db_y6l6QBhGxw1D3CvGfSxuqlNDluWQJKtg7Rk5-7sdclHUPY3yVrrgHtcqJzxJowgVR-gkQWdJ3q1xQjrdDk99_BMsnHqAEw89RL1ezQlAswzLdojjiLbUvP2eZTaGMR_e7kCjedWMFVN8RzcvEiBN6G-sM2cYeJaVN7VDYwuoug5WT-YtcCYQEnpXnbEWE9jGa0Qu9lKqkXLrYhd2soiHF1osVT3WXlph8d77uefoYS49f5oLzz2NylLuf-yR-NDysQ_87n_7f5_-zu_5Ac584Qu85s_cj7ReOUiJg5a7pliWU6FScVA6mxNSB_pWzCRg0Oty9szzuJZFo1bHte2cT10XjQ8ocTp5X9wi9FuQBpbk_qgMlaZkSZo3sZOjfruCVGcoIbj3_vs48tDDOROtVjk20DAxTZswDHP8omVxb7vJR1ZfINONAv6jmUpK3bLkHBz9nR3iXp_A9XAsq8w2mEgqto0lJEmYl8Dk7EsFHGtyZ5oMmu7LShghdHPNkjo3AwOtWW7UkCql092mOTOLX5_lnlc3OXzv_axfusD69oa4svVZ8x3v_lZ-65f_HyqVGh_5X36V9ec-xuzJN93ZiXeH5K4p1mx7pjBJbFsIISfNkf37V5pKJWDx0GE211ZZXbmMSFMsQ2KZBpZp4tg20jAouzIVaAxNzj0u0CRxxNbmBr1ej4pfoT2_gNRGmf3XWmM4DotHj2LaNlk2CrhrTCGwLYthfwhas7mxxtkXz2AZeYmLKkPPE8jxWzR3hSbHMm7tUDFtPCGwysbxAinBs20cy2IwGBCHEabvj3eryWiK2v8ylpfDM7H05T-lhmQwZHN9jX7dpNvrcvjwUkHnZuHW2yxXW9S316zLF879hU_-3kee6qxvfPJrv-17ejvb7-Ujv_lh_r_f-Ne84Z3ffbem4W2Tu6ZYnuXkAyhJ8PKyj5tD1wmkaTG7eJiZ-YW8i-LODv2dHQa9LoNhhByG-U6UJuO-wUX3HdexCQchKyuXcT2XhYVFGq0WUhoF1XERzYoilDAwLbcEMagCHaKBIAjYOH-BLz79FOvdHq4f4Bsm3QleWfa7MewpRdmLVvS3ttFxgm0YeKaBPbEISa1xTAPbMBig6HW2aXhOUSH8MvbLyfcygWIRKIRKeOmlc3xq6yK-ZeJ4lSLUXjBASYNg5hAnG7OvG-5s_XRQrX_ig-__sV8W8OtBozKMey6_-B_-Bd_8bf_wNs20uyN3TbGyKAS7BVEaoIVx8299inIWgcT2Ahw3oDF_CF2QmOQ-VIZKE9I0Jc-Z5FExlaUYgyFzvo9A0I0Tdi6sYMs8qtUMalimwcraFSrzi9iuN0YaFjuPQuBWAi5cukhQC3jVa1-PnUn-4PSFXeN8GTjCoqfXsNujs7mFZxpkWYxjuphSFuXoee-vimVjSYFlGPR3tnArPl61zh5ps_3L7rj5iMxUZcxWfB6cbfHURz_IW77iKzBNIzethchLQwC0QhiWqLTmjh33KscaM3Nvu3LppcNPfPoTP_XoY68dvutPfhtW1ufPfPsPHPg8u1tyVxTrmaefJqLHRz_-afm6R-47JcDUWtwYy3QjKWuLclZZwzYnYE3T_BhlaL3gK8_SlCSKCHt9-p0dttfXeOH8OcJuB3d2lntPnCho1fKjR509FBrXc5ibn-Pw8hIzMy1euLKFTtNdlJcv4940qDRhe30NwzAwLQuRhniWhRQSdFbQlUFgW7iGxJBgSsHW6hUcx0XYdmES7j80NEp76CK6KEf8HMXvDZXQsAVH5tr0lpdpz-WUY0JM8BOO0gwFBs3wAtrL3kKt2fpHC0tHwtOff-LfX77wQnLm8xf58H_-ad7y1AXEP_2nBz_p7rAYB3COm5aTJ1qcPHoSz3bmakHlPYYpjo7orW5ZJoIDY5TaNGXyuN9TXpRYYg71uOWOFwTUZmeZXVigWqmQRCH-zAwzx46RFQ2jIe-KMUqsGoYkzTK00tQbDTbChM-vbhHZLkpMdxgZ4whvQrSms75G2OvgOg4SjZ_EPNBqMRf4SCAIfEzLZJhlvLjToSsEGDZxHBOHMZWgkie6i4HczAiEEFNBD1FMHDfuc48tmJca1xQcXl4umG2nlTevVBifQwuB6bgV3w8eXzi8FG2tr53-um__K-HqhZfoPXgP7_rmd_Ez7_uF2zH17pjclR7Es-3jmMJApek9WulTd5LecBTSv4qNQhd840i0EkjDImi1WDx2jChJGA6jclKN1mM5CrQIQaPZoNfvkUQRrm1iSVkECCbLK24Wk1f4eP0ena0NbDuPABpa4wlB3XPzCe7aHDp0iEPzC9Q9j5ppYQDCkDiuS9jvs355pdhFb15GDbzFCMxU1MoZSUrTcVi9dJGZovmCntilRLEATSrV6K40Am1ah6xK9fsXjhz_0UvPPP1l3_Qn3y083-ctX_On-dTvvJ8kSe7YvDhouSuK5QCOY5Nl2SJQ3bttzC2ImFQZPVGJl3-EyEv9R5_RrqOLDwVKQcsiPG3k3UdQirDXLYMVejeCQ4NfCQDJ2toGjuNhGGbB0LSLlkVQMNzeSMPy4EAWh2ytXsEUEimtIkGs8A0T1zIxDclss0k9CGjWayzMzNCqeNQDr6xL83yPYa_LyksXScOozEPpEdLlRp9iPJPVxFJrXK2xsxSBoj3bzlEqQuxdQLnH35WGTMia6fnf2pid-4-fO_u5vzIcDGrDK88iYzj7qd_hZ977z-7GFH3ZclcUy0AWvHKmK6Q8WHNU5A3UxgkaPa1sex6TJ0t1mdcp1uYsRy-YUhCHw9yIFGKqWnj0J9M0aS8c4sLGFpe2eqx3cg6KsjZLTPscuwhsd3Mi5SxOWcb22joqSXBsu0SK24ZB4Dh4to3vebSaDYTMTdJWvU4zqObBl2YDP6ggLQvP98nihMsXL9LvdvM0nySnHrvOp2xYMjk0cro4mUX0dzZYXjqM67gFI9beSjUi2tSTH0pLQQjLesitBj-8ePToj22urX7ZN73zz4tKPcCPPseZT_7fqP7snZ6mL0vuimLVaz62beN6jhS3CxS4p4jr_kYwbRvmlbcKsyjT4Krg2NjQE0Btps0VYfGBT32OlTBhEEUl9Ge38kw2l1NTO0MhStHZ2mLY7-MUnSalIfEqHs16jdmggm9ZtBo1HNcuOQErrk27UUdqsB2bar1Otd7Acl28wMdEsLGyQndzM6d9uoFchcAqzOE4jFi9cgXDNFlYWBzvZ7vWrknTUO9hiuuCDEhpUNKsmn7wrY25-Z_99Nkn_ko07Nf_3N_-1zQabf7wP_4dzn_iN-j81B8NXOFdUaxqvY5lGLi2LeTdbAlxDckp0vIdA6WwrLyzvUKVM2eKYU1rlIC1OOHpQcKqV8WeaTOIY1Klxw0YipITPdoRxbgesPxZlLh3NjfZ2Sj8qqK2yq_VaDabOFLQ8lzatRrNRr5bIXLFcqTkcLOOlWXoTCOkxK_41JtNXL-C4_vYlsXW2jqbV9YhzfYdyiiVQWv6UUiIgd1sIy23qDPd40xa39DoVSPfFkmGRFvOg06t8cPzy8f-3WBn4yuT4cB73bf-JfxqjReXAr7r67-Wj__nn8Iw7krsbV9yVxQrShNEq4Ft2Z68mfjvnZK8ryo6iUFnpEky4TuMHfORM6-EZEtpPnz2PC8lYDVnMV0XpTRxFOcrtJ5erSd9nPyao4srOtvbbG9uFuSgJobjEjQaBPUapmFgJAkznke72cS0rJJVSQNSaBaqVWpSYupx_M-0bYJGnUq9jhsEuL5Hr9thbeUKaRTvq3xttCgkSUqKpHr0Xp7dGbA2iK5J832zqbPSEhBmVVv-t5iV-s_VDx37P_qbG1-TxXHj0Xd8C__q3_0wh5cP8VfffII_-KWf4H_7wR-82zPmKrnjkzoMQ3yvwt_-3u-XpmMfR4q7TmiTixiXPqUpcXeHLBygVUYSJziOs8cxOSJ_CPzBhSt8dqtPEjRIyeupHNum3x-QakU6ZiUsZXISjlRje2uLzY0NHMfB9n38Wo1Gs4Xr5-FyqRQemuXZFlXfKyN26CIkojVNz6XtV5CZRhZgrhEzlev7BI0mQb1BJagShRFXLl1i0O1dp_Pj2NdSQL8_wHRsMr_KZSV55so6qci557kFZbrWNRWQCmNRW-7_ZAb1n6sdXn5f_8KTf2fQ7bxmsL3p_uj7PoCJ4H94zT38yt_-rrs9gabkjivWb77__VjS4C9-3Ve3hBCvffkulp6IWE3-ky4_WqnCiB99VG7mZQqyLP-kCSqKSPtdws0Nop1tdJaSpook03h-wChkOOasEWRC8Mz6Nh87f4WeGxBLo2jkBkG1ilKK4WBQ8KrsLtnXJcOuzjI219bY3tjIu0U2mtSbLSrVKqZlFeXuoNOEGc_lyPwchjmRFRO6LLtxLYuFeh2hMkaxlpFyCSEwTZNKtUq91aQ508KyTNauXGFrbQOdqj2e7RgJHw2HRHGM63ukQtB3KnxxfZP1weCabcFvXURBtS1IhdFWtvt1ZrXxL_25Qx84-uiX_ejW2pXX_ebP_KR0XZ-3_0_fwrMf-_k7NItvLHd8tzAMk1rgMxiIewX6wVtd30aejkqLgr6ifY3OcqYfrfKSEF1gA3MqMV12WBy5SzlzbY5u11lWKFxaVtaGSYoyLJxKZYKltiAlE5LVKOOjL1xi2_LITCePBxR2lWEa1GpVtrZ3EELg-z4TQceiqXVOLtrZ3CbLEmbabSq-j2maZY8piu6TphbYScpiUKHueXlpfXkeUdaXmULSrvhYV7aIyyK3PN0gR1AsQb4rWhau6zIYDOh2uyRpQqPVwnWdCTqBPDWRhCE7OzvU61UsK6dei02bs92Up6-sMXfP0Xzh2rUTH9QOlo9bGFKaRw2_-p31BePt3_lDP_7ei8988eeDeiP6me_4S7z42z_PWvXHeN2Xf_xOT-0pueOKZbkw02igkmTJEKLxsk6mNVcuXmB95RKNWhXHsjHGxs_US5ViktWpPLz4n0KgkCWXxShapdjs7FBbWMKwHDI14pAXIBQxgi9cXudCAtSqOZJ9Imwoi-RtvVal0-mSJimVoII0JGmS5ZyIUUSSJATVgMrI3JsCvY7RJIbWeGnKve02tmHkdM1ibMKOGqwKAW3Pw1Mpw0kG-aKWSkzwLAopsR0H07apBAGDwYDO1jZpxc-Ja0ResRyFId2tbXzfw3e9khErE5LQCzizucPrjqT4xoi47vYEpYTW5S4mvcop37T_1YnXVA_111d-4p_87uc3n_mDj9EwvotffO87-OZ_8I9v51S-rtxxxao2qlTqAYN-p2oYwrxVbOpoujVaLXqdbVbXVhGpQmSaLMn9IttxqFarOI6D1hlplvO4CwGGNDANE9M0MQ0DKQWmkBimhVZgmQar6xt0k4ylpWW0yNPDWhSFkkJyuTfgC5fXSIMGyjCRWpGhpngFJeD7LqZp0u316XU6IHJuP43AcR2qtTwoMdbLwrzTk-fRmEqTdLcZdraA5RIBocV4QVCFQs9UKjQsk-0sQxjGtNLr6Z1EjBLmlpX3WPa8vJ9VHOeJ_DQlCSOq1YBKpTLdkkhrhOWwNeiyM4yoVP398vjckoy8uNH4pWnNGpXq9wWW9Uh348qP_spP_tAfftv3_qD6mm98K__fif_AG_7ct92JaX2V3DHF-mff-73cXzNJtrchmMexVltCYNw65js_slKtc-rhR0njmDiKSOOYcBAyHA5xHJsgyH2UJImIoiFhOCQKh2RxzDBJUcMhKk0Y9HroNOX40WNsbmyitCKUkiMPPowTVFHkxX0lu5IQdAcR_ShBuzkSQZZ9r8YRstH9ObaF3WyQKZXzBkqZk2VOkYzmcnXqKO-bLNKYminZWLnE9vISzcbMRAuGUcg9V7bAydut6ihEVipFkOPGdTm66LzYmplhOBwwHOQ9qWZmWliWNS4anWLEMggx2Q5jDlerV7ENH6SMFtRx3lGTIT1pu-8OZmYf_64f_ul_ee5zT77fbzTDH3rXt_GFX38f_-cP_Dj_5uOfuG1juvY4b6N8_OMfZ_vMk7x0eZ03vu5RDi8t8qs__0vz7_imb_zJ1tzcn-amChv3kBEr7uSrFpPxgREZ-STPrSqDGkopVBqThEPCThcrTlm7fJHzVy7z6NveTmV-CXazGBWh8-0MnljZ4HOrW1yKU4a2S2p5ZEgyMe5OoktoU44u1zlBbDHRxyyjo-cgRM4sO9qFpABLg9vf5G0NnxOWxAHuf-BhKIErovTfDGCt2-U_fOzjPG046GabpGCmHfX01Vrsa_prrTGmwSal8grAEBobxcxwm69pV_iK40emkN2jLiy3Qwwhxoy7RRdMkSUbyWDwo1url_7t_NKxzSc_8kH8ap0XvvAsf-rv3zl41G3NsP3G__N-vuzhB4g1fN27_xLnT3--VvP9N2ql_l691fz6oF61RjRatywj6tzy5zSifW_UfF4rhDSRhoFhWjiej-f5ZGGEY5gkOqO-tITlB7uaHuSiAcsUHKoHHJupEwiN7vdJ-gOyNMOUY0yiKHCI4_VWj4erJ_jlJ8G9E_cnNTg6pRZ1efPyPKfmW6xcuoDn-0VARJdHCkBnES8-_wyxKVhVisRyySYDwOXzurEvlIOMp_kyRFH7JdGYAixhYIZ9GnGf-xfnkXs8q9sjE-1dR62BpOlL236DF1Tu6a2tXviVH_kXl488_LieP3aErzh6mA_8_p3ZuW6bYp3-_BN8-Vu-ml5ngwsvXfSzsPOOQ0uL_zioV_9OEsdvrNUblucHpX9wEA95738T1_z22BcoQt5akYRDhEoZxCHKdqg2mlNYv9HBqjjYQlM1JcuNgFNzMyz6HlYWkfa2IepDFpftaKTM24KSd6zK_5MT4ynZnCYLXcAQCi-NOELCm44couGZxHHMpcuXaLfnMQyrpCWTZFy5dJ7t9YucPHU_5za7bCnITGvivOKqtagk4Jl8RiWdQP58ZL7fYgiNJcAGbKVw45BaPOCRuRbLM42pp36bSbcmXsnEjiyEJQ3rEct23nLq8df3n_rDTz7VbLez-1_3ON_40FH-_X_9_ds-ntuiWGee-yJ_9W_9KN_4zsfo9QYLh5cXv6_WrP0Tx3NeEw37la3VK0VI139ZhbUvR8reAZMrd5aR9vqILCNDkZoGtZmZwhScNCUnyyjyHcbUGl8KFqs-J2abnGjVWHYtmirDHPQZbq6S9rt5PVXRJWREdFNO7ilrtqj7Amw0Qdjj1XWfhxdn8nosz2NzfQ1DSGq1PLgqRUa3s86Lz53myJFlWq0WW4OIc50Bme1O0QSMoqaMN68p5RIjk5TcdzTIFcnRGU4W4SZD3EGX2rDLcal4y7ElHjrcxhJiDLC9g4o1-X5EoWDCsmYc139zq92Ozj395GdrjUZ68rWv4c-__a3821_4lds6mgMPXnz-c09wz4kH-Y0PfD-DQXSo2ax_v7Tkt2qdmdsb6_S31hiGvbJEY9wY-M7KdMF8bk5kSU6lNlIjpdSEBk4eKzAmyinyvr4FuUyWUkNQDVyOBx7xYUEvVWwOhjy9ss5T213W05jQ8YgMiwSNGoX5x-tueUlLC5xMU1cZp-ZnsETeyse2LZYPHeKFF16gVmsQNGbodnZ47qknmZmdYWa2jdYZ9840-MTKFlGeAxolxQo_dKxco4eR-3ei5GQ3EVg6w0wizGhIJY2ZcSwWKh6LMzUO1wMWAp-qbSB0NtVU4c6_1eL9FKul1hpRCVozy0e_78uCirHy3FM_Nmg2hg-85Q08-5H_m1Nv_sbbNoYDV6yFusnO6lniJK37nvd9wuBbBZiDXpfzZ8_g2wZKq7wWSt-9hz-SUYBDKEUWxXmSGEUYhshaDS2N65qT03GqceBEF2X_NjBjCmYaPkfqR3ikH_LU6iZPre-wEsHQ9ohNB4VR1jlB_myMYrdyoj7LrsFivVp2u9da02g1qW9s8uzTT3Jo-Sjnz75ArRawtLxU-GYZhwKHw67FTpqiLCtHfwjIivY7U3XWGswi12wosJXGSob48YBZQ3OkUeGe2UMcqlVoWhauIZAo0Bmo9DbGAvf_LiernUcdW7TrN5z23D9Y8j3RXV35sf729uDUm7-Rpz74Cywefz3N48cPfCwHagpe_vh_YWD5LBx9EJV0v0Ua8nu10K7QGZdfOkc87FJxHaIwYm5-Edt2x0_kbonWef_hJCHudNBJTJxErHc7tI8cw67U9jHAvZ31SeMRrTHR1G2TI80qR5s1AjThzg79Xg-UwJIGUsg8p4bGQuHqjPpwhzcebnOkWS0QIQWbRmEGdjvbXDx_jvm5NkePH83bvhbXtw3BIFWc3RmQ2FbJ_z7aEmXu9-cfAYbOV1s3GVLrb3FcJLxhqc1b7z3Cqw61WQo8qgbYQmFoVUYH9XXu_k6JEFcjukdGkZamazjua_1qVab93hf-2ff93eHa2bOocIu5-UU--LGDDWoc6N1_8alPcKg5S5akC17g_7yQ8m2gicMuX_zCE1Q9D9s06Wxv8-CDr8b3q7ndfxcVa6RU0fYOcbeLTiMura5gz7ZZeuBhtGHd9DmV1lP5JbFrVxNotJREGFweRHzk9Bm-cH4Fy6-TWBapZSBNiSUFTpZy0oKvf_gUNUuSCY0UciLwInJMYxRjOw5IySi4Lwpz73KY8f4vnuVF0yWSJqnQhec03qlKXxGFFw1YjAe8bmGGh5cWqDtWvp9qVSTHR7yC-f0oNKpInN9NkUVQZrfk1kO-Q5uoIXH4y731Kz_603_7uz_zZ77n7-tKtcbZs6f5incdXAOGA9uxLl68iF6_yOKR46RJ8icM0_wbgCOEZmd7g631Veq1GkopkiRhvr2IadnsI2d5YHLVWqoUOo4IOzvE_R5kCStrV0gtmyMPPoJ03Bv25L32dcQEsGriN8WqKsh3sJpjcny2RYOUY4HLqw61OezAoqmZl4pDluDVSwss1ipFg7fxmlzmuoTIudqlAVKUz1QUKAzbMFjrdrnQ7aEdt4Dz6XFwosh9OUrh9TvcKxLeceoYjxyaJTAFUquyZkwLplqZTt7bNAvWnRdxDcUqu5FrjRLCEob5qGPbb3n4zW8enHv6qaeb7XZ6_8Ov4p1veIyf_qVfO5CxHJhivereNoeWlrl47gVzZnb2rxqG-Zb8JhVXrlwkHPQIKgFpGpOlKXNzhzAs67a9hjKJqUGoEdJd5VWzaYaKY9J-n3Bnm2zYR6qUza1NulnKsUdehVWtlS_rpkmVrjuqXd_RGscQzFQ8eusrtD2Lx-89yn3tFqfaM5yabzNX8ZFFta8ckXdO5Lu00vT7fUzLRJojJildmIsaKSWW7XJ2Y4OBYSKkgRC5YttoLDR2ElPrd3mkYvMnTx3jeDPAGPH4TuTYRrhEsec9302lGi8yU-MaUSEojSrMaCEE0jRnHdd5S2uunXRXrzxhuF5y4tFH-Y6_8PX87__ufS97PAeiWB_60E9x5ukNHn74BNudnYdaM7N_z7TMOV1wN6xeuUAWR_h-hTRNUVmhWC-3IXZJcaEmSkEySFJUHJNFIdlwSDoYkAx6JP0eSa9H1N0h7u2QDPuQxJAlbG5tshFGLD_4CH6rXXZmPFjFuvYBjmVScR3OnzuLUIpmrYotBaYuAhpFklqU_SRHh2q0VmwXAFlhTiMx8i8JAtclRXPhyhpag60y7DjCiUKCYZ8jQvGmQ23ecu8Sc75J3qtMlMGdqc8EkVyJxn0ZOiXFuKTlVj9yglNk8sOI6SoM6XZ2cF0HIfNlSRumZznO64NaXUWdnc8gZTJ731dw8RO_yuFjD_FbH_zgLd_TgUQFvQsVDh2u8qEPf7Bx7Mg936W1fnC8J-dJ18mWOQdVtaOzjGQ4REUxOk3zLoxZznyrVd5KFKXyxgdKoXSO00uLspA4SnKO8yzDrtY4_vCr8FptsonSjztVsaY1NBpN7jt5kueefQ60Zmn5MFLKkppiL1NrNM2z9FpUYbkZZJPymsU22-vb_MELL1JxXFrVgNl6lSO1FifmZpitOJi6qFMT7KsviuYAlOoOPN8sTdjeWKdRr4Ehi2cuUYZdkxX59wPXcbLB4Eej1ac3z33x87zrHY_zjtl_yYP_89-_pesdiGINm13UBc1Mq_U2w5DfZFqmHNm1KlOE_T7SkGWKXxrGRC-YW3-sSRwz2NnGiBMMnRe-d3d2uHz5EoYh89qjLCNNU-I0odvvIR0bJ6iwubXN7Nwi9eYMCwuL1NsLSMclhSnG9TuVv86ZbBWtZoMTJ0_w3LPPglYsHzlaFsCMsIBiF2B3Mmgg9vAlc_ygwBz2WTYzlh-9n6X5OQLHwTEllhAYQoFOGVkZ3MbSj8mx3injUQiByrJxEU1ZQiTIDKsqhfy7pi-Pht2dH_ngr_zC597xLd-mm695lP_yI_-cb3jP99309Q7EFPyOv_xN_Klv_hucffYzf77iV792fnEJIU20gEFnh-eeeRLXdagEdbI0QwqD2dl5pDRf1pMVQBrF6LToZ6U1WZYhpKBaDQiCgFq1Sr1ep9qosdHdwWvVWTh-lKFSzB2_lxOPvhqv3kKb1kSj1nFu51bIbm4lODaq8AXwfZ-KX-Hs2RfRWlOr1cech8VwJoloyBS9nQ5BtZr7WOUoRqBeQa_b5dlnnmF-pskDx47QcC18CaYo6tGmMEi3f8pfyyeCPKiURCFxFGLIMeFnuWPf5NAEkKUxna1tGjOzSNOcuHZRZS6EJQz5Ksuy3nz_o6_eevYPP_pM0JhRh44cot4-wu999GM3dc2DMXSE5PKzH5RCiAamRMsc2Z2mGRcvXaZWbyKN3KkWCCzTziNYL7O-VJomXq2GU6sj_ABluzjVGrMLh6g1W_hBDadSwa54dMMhW70etu8jLIv2wgKbm1v0BwMypacQA3dbtNY0W01OnTrFyqWLXLpwLvd5ilapk2SaFGh9pdLx65j8vxD0Ox2ePf0MszMzHDl8OA-dK1Wg7_VUcOKui9YMB322tzbY2Vyns7NJmoYFGau65TEKIRBS7tGFbRQGknmc1nQfcuut_-2Rt37tu88--aQ57Pd599c-ftPXOxDFEgiiOBEgDMs0S5Ov1-0SxSknH3go91uybCI7fgBQJiEwXRe30cRvtwnm5vFn29j1BtKroKVJmiouXLzIxuYmS0vLpFqTao0XBHiuy8bqKrsR9nfSRLmWaK1ptWY4efIkly6c59K5F5AqyQGxu0RpnXPHFxxQ46ppQXdzkzPPnGa-Pc_Ro0cxpCwDElq_AqAve0imMtI0Aa2IBgO6nU7egmlXBfjNSMmypdm1iI7AZKIgbjDQlrfk1Vr__OG3ftVbT37FWzn77HP8tw_cHJ_hwexYykBHIISBbbslV8MwHOD5HvXGLL4fEMfDgslnFF06gCksBFoKhGViuC5WEOA3m1Rm26RZxrkXzxKHMfccu4eZZoskScoaodbsDN2dLaJBD2PSPDmQh7KPod_gmvnONcOJEye4dP5FXnrhWXQSjuvPJshpshG_R-EjCa3YvHKFs2fOsLh4iKXl5QkOjd3kO7oM7t0p2c1TrMqxC2zbQRoy53LMEsJhn8GgPxGRvDr6d12LQ48ij0VARlxvJDovP3Gco36z-Z6Lzzy98PjbvpL7H7iP3_mdn9j3_R2IYmmdkWVh3iXRsoodKe-YWK0GWLZNe36R4WCAylKyLCt5ZA_qZU49XClBSjI0zdkWx44dw3OKXlKjVVprbNdBSsHalcs5quCAlGoU_r3RR-z68573paDVanPvyROsr17m7OkvkkaDMcZRa5RSxGlSlnioJOLCiy9y_tyLLB89wtzSYlFcqQtUyO6LTITU76BMU0-PSbRMy8Ky7dzE1SlZGjHod0nSuMRJXuuz9wvJ3RWt8tTE1e9rVOUgymioArDNr_Zb9b_yqc8-YW2sr6O79r7v7UAUK1OKMIrJlMr7NRVmXpLESJlTZzVbs4AkHPRRWXqbfJoJ0ucsw_V9Gq0WovDvbMvClEbBNpubBbNzbbZ3tkiT-MB2KnETn32dTErqrTwB3-tt8-wXP8ugs4EswoOZSlE6QwqIej1eePo0_V6XE_edotGevWpNfiVLXrQocV13nJtSijgaMhz00Dq7pbsQiLxaPMuu853p7yMM23a97zxx6r43P_bqV_P8s2f4tX-_v13rQBQrSlPWtzokSZZ350CgVR5qtyw7bzzterRm59ja2iKJo5HbvLsXxwG8mFzUREfHyV-W_OEaslRRbzbxKz6DQfeuYhavf08Cado4fpX23DxSp5z-4me5fOEF0rhPxbO59_hR1i6v8OTnvoDjOJx84H6Cen2K2OaVLmIiWWzbDqZljptJZFm-a0XhLZ9c6ZyKYT_fHS3R0rCWavXGX_3Qh36_9urXPIbd2t-zPBDFSuKMyytryIJKS0x0A7Qsqyyhbi8eJs5gY2MDpdXLa995LSmc0yyOEUqVvYRBkKQpmVJj5x2NYVpUKhU621t7mgmvlGihkCau62OYNo1mi1o14OK5F3jyiT_kzHPP8Pzp01y6cIGlI0c4cvIEpm2jXm729k7d20RwYbQMGKaB7XpjGgE0aRwzHPRQqth19vlq9ETALFesaZTG3oMaVyS7nvc1S0uH3_7qx7-MSy9d4t_8kxvntQ4mKigE25ubeJ4rHDu3Q5VWRHECwiijMbYXcOSek1iF8onJktkDkJHzrrOMNAxz5qSJuHSSpnm7ziK4KqWBRlKpVOl2u3uiF3Thw9zM53YoowZsx8VyPBQS3_eZn5_DcRy2NzexXZuHHnuUhaWl_L4meNtfqTLli06l5PNmDo7nI83RwpxTJwyHfeICyXMzt1f6sHq__TRF7pchsSyr2Wg0_-JHf_8j9fvuf4ilYzM3PPplK9aHf-on8w7pUgnbcizLshBCk6UpYThEypwpQQgDjeDQkWPYXkCn2znA0MX4YQhAJykqjibMzFzhhkmU9--VsnhJQ5QWOL5PmqUMhr1XoDk4RkFIw8T1fKRhorWBlCa1ep35Q4c4tLSc02CXLYLkK3K3mky8X3-EEstycBwPIWQZac_SlOGwe11fac8nKCVC5i7CJJ_ijRjChJAIaeJVKl81Nz__VV_-J_4EW5tb_PLP_fh1j3tZivXr7_sHrFdS-r0-jh1UhJSHTdMqMt356i8NcwIhLXD9gOZsm8srl1FZcsC2YP6QsjiCNKO0NYVAaU0_HGLaFgLN1tYmw-EQIfIXaFg2vV7_rk9GvSuUrCbD4EJiOx6WbSGkLohoioJFwyiDeqP2ra8MI7YY08REvh4-cBycFEhp4rge0jBLlIRWGeGwX6Rubm4AQoqyicQUpvi6o85_WJbddD33Oz7wvp9dWDhyGC1H0e295ZYU6-d-7qf5vf_2s6TuEseOLvNrv_pz0rTMd2Zp9hrLzE3BJI4wTQvDNMvWNXnlq2Rx6QhxlrGxsX6w83iEDQwHoLKiXKRAN8cRUZLg-R6DwYBhlDK3eBhpGAhp4HoVkuTWIk4HJWX4eXeDtvLtCyzLxvX8CRIYgURiSHMq3vhK2av2Nvcm7nlyESnM6HLSI7BsF9Oyxwl8rcjSmOGgQ6bS_WFN9aSZObrufrMLRT2BlFRrtbfPzMz85S8--0VDIPkvv_ST1zzqphXrY7_7c_yFv_AuWjOzfMOf_evESXz4H_3jH_o7j736sff6lUp7tG1HUYhlWUjDnMAD5L6W5XjMLx7i8soKYXiLUZ69HoFWqChEh-HUU9MCdrpdbMdGSsnOTo-j95wiqDVRRWO4SiUocMN3R7H0PgMlo0XAMHP8dE6hZiClUVoFrwQR11Em9pHgHbUmMgwTy3FzU250fxrC4YA4HFzdaWbPsRQ_r1EhsM8bIqhWnVq99u3Hl48_ilb4zeo1v75vxfrMf_0An_nDXydONasXX6Db6Xjnn_vEu06cOPn-w4eXvr9erx91vdwe1koRxxGu6-a1L5oiOZeXlWsNM7NzWJbDS-fP35KzP91XUeSJ0igm6Xbz7vB6hAYXJFlKd9jHtC1Wrqwxt3iEucXlotNiPi7HdfPg_12MAu7nylqDabk4biWnZRPkpfpClii4u5Wvut7utPfOpG98PmlgOy5ygiJBaFBpQjgclBHC652pLHq9zreuX5ya34lhmszMzN5TCYK3v-3tb2a41b_mUftSrN_-zZ-hde8hJPC2r_mLDAb9e-974KEfaM3M_ttKUHuLYZiOUoqg4iNlThs2GAwxTTM3VcQ4KjMCfQppcvjIUbY7XdbW1m6aZjp3ZvOIn1AaFUVE21ukg0FRe1VECAVcWVtlbXOd3jBi6ehJlo6fyNmX9Ij5QWOaRu6oFsSUrxxjao-XJgx8v5rvWoViyREG8A6KuEYwQlxHkW5m4Roh_m3bwXFcJtlNBZo4HJIm0Q03oMnYs1Jq1_f3s4cVVGpAo1E3Wq3Ww__x_3qfrbOEj3_8I3seccN6rBc-92GOnLyXixdeYm31inP-zCe_odWcfY9lOa_TGkMjyLKUOIqp1HPiyCzLSJMUx3XKgTGBoi6HaxjMtNucO3cey7JotVo3t2OIPNObDgZEnU3S4SDnthM5R3qmFKtrVzh95nlaS0vc_9hraM4tonT-oEbN3ISAJE7K3NvdIhG91i3ultz38LBsD50VkdcJfvk7Uz92dUnNFKfgAez8o0JL07RwvQrRsE-mR1hTQZbERMMhlu2Rq_V1rllAlq4GHk83A5z2aafLWjTguB5zc3P3n7z_vhnXdS9fPP0He17uuor17Gd-k-OPPs76xRcYDHrBqx59_G95fuU90rDaSo3LEjKtSdIMu8hhJVGEyhSu44zLtyeGJ9AkScJTTz3Fwvwc84cO8czp05w8cYLZ2dkbPe2iDk-j0oSo1yfpdhBJhCl0PpYkodsbsLa5yTCLefi1b2Dp1P2Ynp9X42o1ZaoIIBwOc5SG0CXT7d1WruvVLElp4noBSZzmAZg9vnMA9QN7npMiqnfQinS1jE1923ExLaeEwwmRp0yisI9XCTAtJ89RiUm9GM3RMbWqnngu-XnG71qrjCtXrhAEAZXK2H8a0c1RXLdeq59amF94qNFsXP7U5saeI7-mYp357O9xz6seo7t2EZ1l1cNLR_-eYVjvEUIGZSubYuBKKzKtME0bISCOIkzDyuFMasydkJNFKgxEXgqQZszMzOB4PgrFM6dPc7jXY-nw4bJjIHq6XmiEmlBhSNLrkPb76DQiCod0-z16YYgyDEy_wvzJU7QWFrCDKkoYqGwiiIJGFZAqoWHQ7WHY1hjkuUdIeLJxndbX1rqbNXlGJx8hDyYrgPU1Es4CMC0Hw7QZdarbvRbsrrO6tQLM8qbGD-FW7u9WpbgpwzDx_ApJPERnqmTdSNOINInGLYamKoDGT0QX1eqqbO9ZnKFEzAvSOGTt8gXMQ0tUg1oBDh5bNbpgbXZcrzXbbr_m2P1v_J0Xz7y457D3VKyzT36Cow-9nu7aaaJhv1qpNr9HSOs9WlPJISHjkg8hJHGcEsUphpH7Lf3BAMd2MAyTTOmyCp-C-EQJGA76zLdncT0fLTWHjyxjuw5nX3yRzZ1t6tUajXodz_fzGiIh0JkiDof0trdI-l2yKGTQ7xHHMUqDU6nQWD5KbW4OJ6hiWDmsJ9PsEe0bK04Wxwz6XRYah8sWO9MTa3epwW3YyrQud6ddhGnXmG85cmQUit7LK9wdI7yZUU-ySI1-7jaTbqeMd5kxrZnjeliWS5z1S19dZ4okDnFdDyH3ms4jFSRfhBgrn55IYwitSaMIR-qcpoDp3TinwRNFfs0Q9Vrj_o_99i_Zhw4djp9--ud54IFvmbrq1Eh-8if_BW9-7HEuXzxLfbZKGscNL6j_PaTx3ZmmIqbso_EA4yTBsiws20JrzXA4wPMru4wRPS7EU5rBoE-z3ihWkfwbM-05qvUGne1tNtfW6FzoYtt23hK0eKlROCCNQgLfo1Kr0WzP4VYquH4Fy3XQ0iganwpUpm4cghawvbmJzjLq9XrRgHua7-JqK-v22Inj1XE_587D7LbjFQ75rY_n9pt0ByECw7SwXY8kDvN6mnzExFFElqWY16QDzxXTtuxy-dl9nznfZYQQ6pqJ35F_VmBgTy0eWmgZhrny5KcvX_XdUrH-83_-Mb7svoeJopAv_5pv5srZTx8Pao2_Kwz725QWvp7CWE2vg3GcYNkOhmGQpglxFDI7O1cWro31K5_kWZrQ7XaYmZmZ6omgtMa0bWbn52i326g0JcvUmARE5ok6U8oyGy-ERIscXJlN2NZin0Q1Os3Y2txkbuEQtuejlN5nAfjdd8KEkDiuVzZfu1mleOUq0dXjHL1rx_UYDnpkSVSOP01ikiTO_axrPiywbCvP9-mr_c8sS3O0kNakSXz98QBSipOu6z3UqDdWcD9_1XfkaOCPPfgoSZbxn37kX4rLL_zh1_pB7T9I0_5ORa5U1xKlFL1ev0hQSqIoIk0TPG_Eyz6BBhAj1laNbZnYZXBj9NWRU5zbs9K0sBwXx_dz7grPx3Q8MB2UMMiQpLpgOJu6Fuh9zHkhBL2dbc6cfpZwMERl2RT_9z7U8rZMopuRPNcjr1v8d1NFga9okVi2g-N5ZXNyhECpjLSoDL_mc0JgTAR5dn81SxOyNA-MxEl8g4pkjRByxnGc1_qzJ5hpXB1wkwCnn_gtBoMBP_wTPyT-1g_-yDsr1ca_kabzlkwJQ6tpjtO9zJVKpUKjkYfah4MepmliWHtXW4oiumKZFqZpXtuHEAWsR-QGZFZyNKgSjyJKrgK9J0XINc488VQVqysXEULz3DNPc_mll0qnVpS2ub5GwvX2Tcw_mpP-9osQIKXE8yoYll0s1_mcSOOoCJTtJQXNmVLj0qApTJMmTZMy35Ym6Q1TzkIgLNN84OO_-Yt2rVrlh37on059w_zMx36X-179lfQ3z_AD__gHH3bdyg9Iwzqlr2FajDV-_Lu5ubmST6A_GOBWfDCMwncaDz7fQ4vooJQFa84UVnZy7OPHspuaayLZvMfXr2umjcxTgSYe9oiiAW98y5vodvucPXsWv1al0ZwpeL7HeijEXs_6oBTg2vmgP66ymzO_7DWMyHct1yNLorKuLoljsiydQmiMZdSdRUzxM44mllaFMhXPPctSJiJu0-OaGJ9hGKcOLx9uGdJcecPDj019z6xUBCvnniBL0mq92fxuKa1XaS33HU2anAQqy0v0W81WGZadIikROaohzRR6pFh6nHiYDmFP35VA7NOn0XtE8aZJkfPzKTZWL-P7HkG9TtBsMYwjnn_ueV71WDUPvY-O1Fynl9fei8_NIUlGPtJNHPLHQPZ-HgKkgev7xIM-aZrkqZxMkSYJlu3uMU9EuUPpEvU_5idUWuXU58UimpaVEdcelxYShHFCGNaDQa22EkUvTH1HxknCwtFX41eCPyWl9WfRchItf1PueRRFRGGC6wd7j6uAIOUdCd2iruhaV7olhoj8yD0m9bQ5p_KcxeolXN9DS4kSmqWjR5BCcOnCxemHdAuT4uZlNwj1j6ofdFByrfef4_lt28PyfBjhJHVuzu39zHRp7o2rxEW5kOfPuohY6xHs6TrgXsGoDqVlGuZrG4sPIHZVn8t6vcELT30sMEzrzwpkfTyQm5Nhv084HNJstnJc1zU9k5wLwxDGVEuaA3sdN9Q_jRSa7s4mURShgcFggMrAtGzuueceNjc26Hd7L4fG7o9JMOFuSNGbSxq4fgVpjtiU8-Laa237GkWaFtG-icYO-d9VEb4v_PUyGna9UYAUQtq2ffx9P_5es1ILpn4vHcfFr1QaUsgT43--SUCsgK2tLba2t1g8tIAh5bhL4B5nC8OwLJO_ra9gctKOzNK86ImtjTVs10Fp6HZ3SOIYDdSbTWq1GpfOn59oDnDr1_2SYh20jKO-tu3kDeJl3q5IZdk1yWKEzjkzxvil8dzL0hSVFoEPNeI33J8WuLYz-_rXv9Zqz87yif80bqAgLdvGtm1HSOG9nJdbCSqE4QCt0oIOWJcpLDGhYALBYDDMw_Py9hlZe07eYrWLwgGdnW0qfgWUJo5Cut1t0iRFIzi8tEQaxXS3tjHu4Hzf6_l_SeH2Fq00Qhp4lQqmaSGLpgfXq-rNCiZmmF7ts5FCFugSeZ2-05OHa0CaxlJzplUPqlXsI28pfy8N08AwDfFyGitqrakEFaSU9Pq9XYjg8ZYrigeSRBGu56L3uRtkaZqbbTecZNfJY4hRvVC-W-lM4TguSmWoLCUM-_T7XZRKcTyH1swMF8-fJ4kOjm9wH0_yS4p0Q9FTIFvLcXE8P6cH0nrM4LSHjADEk_-y-xghBUbZWOJGIgBxj5Tm_bVane7OTvkbKWWeYLzaodA39TEME9f1WF_fJM99TQIiR5E6TZbEJFGE5zqoUQnAdT4CzdbGBpcvXBhTK1_zU4xc62k-wfIhaFSasr2-huflDciUUCWyedDvMhz20Ghac7NkOqcPEBNjEdfwHQ9q0oyZDyd__nH65KQEWu_92f2uhTTw_ArSsnNaA5WV35myVtQYjqSL6-R4RM0Y_5pbWaPq7Ou-qXE-d1ZK-eV26xi2N0Z-yJJe96rJokvq3Rt_ciVqNmfodXqEg_AqlPXou0kcgVZ4nlckea99nZEd2e92McSYf_uan-I2NlbX2NrYuGqnkQgG3R2G_S4VvzKxm-oiqhTR7e4QRUMsx-LQkSU2ttaJk7go1iySlLe1b_IYcS1udL9_RD97KdRYeSYR53t9b1f0VGkMw8arBCCMq44duwE5uHpMg0Z53UxlRVFs_t0RcEFf9y2NcqIIYRgPfex3fsmpVCt8-H0_XigWYqJgbQINeAuBBd-vYBkWa6ure44q92-GWFaOurhR-YEAdKaIwiFBEJTD29N_UqM6KkVneydfuXYldaXOzUAhQVoGWiskaty4TWuSOKTX3SHLEurNBoZpsLm5ftvU6JovrrivW3kPryTZ_Z52VxPfSuBm8rlorUFIXNfHdty8zdFe5xvtWvlfyl1La1UgNsYJaMMwb7xwFiH3nKXYOLG4uNioVWtkgQf5jiWK6tPxLNyrVcx-REpJu91ma3PjKi70kYYPen0qFT_ndC8Tw9e-XhrHpElSViNfM6pWjD2NY-IoxPcrEw-gKOWOBmxurOFVfHRhBoyWphGjE0oTDgcM-n0MKZibn2NjY504PjjSm_9eZbcC7aVEBymjRLzWGmkYeL5XjmMvUXoyjD4OteeBi7L8MS9_uonYuJTyXtu2HmjNzCCi3F-TGlkkykYz8NZufmS2tGZbeI7D5ura1G4hAJVm9DpdPN8vKzKve86iKbMALNu5sWdTNC3L0rTIpY3HJoWm39tBZQme5zGqdxuhDUWxowlyO33Q7xEOQ-q1OqZpsrm5ecfJPF-pYfi9FOhWeS1ezhgmm3trwLFdTNPaO7o6Si1PRKLz9qmKLC1MweK4EVfLfkUKMSOFfH21fQoV5JAqWQKn9gMHv9HNCoFpWbTbbS6cP8-w3y9viqJkf9Dv4zhO6UPc6BX0-z0sy8Y0rfwF6mtnxIXIK5MNKZGGnHrAcRyisoi5hXmMonRg75vI_5ckMf1eFzTMtefZ2Ngkjq9fTvDfi-xlEdwtBbrROCd3rby3Vk5xN-UjlcgKJlI8eUh6FGYvavUnwu37uLdxVbW0LOvUL_5f_8pyncIUZOS0lVwPL-9hKaAxO4PtuZw_dzZ_EcUgB70BhpnTJI8xe9cRoRkOBrieizTEBPL8WhfP6HU7VKpBznpa3HyaRmxtrnFl5XJeGjD9dPZGiGhFGA7p97pUqwGmYbC2voZG3VFM351a_f8oJq8nKy1y-rcp8tqxqc-Yfi_Hp47OkJecjKLTonAFDLk_em4txqBuy3FmHnr4EXt2ts3zv_2fkKrQ5nFwV5e1_jeLGihDIIbJ0XvvYafTZXtzC1nkC3a6XaqNJqZt52ZYuVDsdT6FzjKyLCWoBkVE6drccAJBmiSkSUK91SjAlpokiehsb7C9vsbWxubUBj3-aLRQaKFAjOqPczrjfr9LmibMtdtsrK4RRfEUmPdOTqCDOM-d9oNut-xuQjFC2cRRWIQBx_8-ql1jIjinlAKly0apWiuEceME8VjyeWaa5sJMe7Zaq9f44noXqZTO2WC1nijPeHmQnExrKkGN5aNHuXjxAlEYorWmPxwS1GsTPYiv_dLRuemYpTkttBZjwpW9708ThkOEKXF8LycaSWI6OxuE_R16O1tUa1UM09jjYD1F6pz7XPnf0zRm0O_hV3zQeiIJeOcm4F5KsJ9j_ntSoBvd66RkWcrlC_m8G0X69ASnyFRJkpoOzyudc4nso4tWfjxlBccxIcSpaq3GYLuHHNUOjr946zdX7lw6v2B7ro3nubz4whmSOKZWq1GtBoU9nB-3p5oUkc9wmDPyGJa1r4nQ6XfxgwDDsoijIZ3tDcJhj87WJuFwSFCt7uP-xkhnQQ7OjKMhWisqlQqb6xv7Wnhul-wVSb2REv2xEiGQQhIOhoSDQQlEH_1OyOkczFgxRIlsF1LsGxU0Pq9sI8QbKjMnOXJyGZnH8dWBrL-TZBsUjuLRo8fI0oxzZ15gfq6N67hMO1jXSHhpGPT7JcTkqmtddW0IanXa8_OEwwE7WxtEwx5pNGB15TK1Rr3oNrnfe1FlGD9T-TOqVgMGwz5Z2epV3dGda_I5f0mJ9hZRwJKkEETDcYpkMtBR-l3okpJLkFOjCSFy5MVNPkohhHRs-9FPfegDbrNeR2qVoXR2YLRWI2TwCCZl2Db3njxJFMWcO_NCTtghxkp4zWikLgIXroc0jGtdbCovUfF9lMrobG-SRENQCWsrKwS1KrVG4xY8o9HuoEizlGq1immaJHF8y7m-L8ntFyEE1SAgTZKJdzgqNxmH2_VU61RNmqU5A1PRimq_MvLrTEPe02w1657rItM0I01T9L6tyhtfZBzMyG1b23U5ef99DMOI5545TRqFZeXztfQqTVPCMKRSDaaAkyPIiiywh0LktGp5kGKLna0NsiSELGb10iVAMzs3V_pot_CacrhTluYhfJURFeP_krxCRQgc181LgUams1Jlm9QSf6EUKkuLMHvOBibKqov9dn4szoUGKY-blnOyVm8g0yzNa6P0BKH9y7yvEo4zgktpje253PfwgximyXOnn6G7s7Xnqj9StkwptBB4QaXEepXB9iKSBxlZlvdK2t5co9fdAhWjkpjLFy-QpClzC4uIgp3n1u8rp1cTQqNUShJHBQzsZmusvyR3SizbJopCtErz96ZVYeqNvpHP0WwEZ9K5ohmWnVcl3_RkEUhptm3bfkNr-VWYSRyTFUkyuQfb0a3KJMxICIEi5ww8fvIEly--xOWLF1k2TWzPy_kDEOgiYiMK_2x2YQHLdQuqzxEnRM53lqUJcTgkCodE0RCdJaAVg0GftdVVbNNiYXERYZklCuxl3E2-S0qBSmOi4eBLCvUKlBHNitIay7FRo-YcllU0qZvsekOZtx0R1WRK5bVd0rjZKxdkNVqalv3gf_n5H3fMMIpQWSaU0gJufgvcj4zsW0TeYeTwkSMMuh0Ggx7DaIBlO1iWjTStwjfLAxatmZnC2RSlPawKQtBw2M-55FSGVglROGRna4tOZ4dms0VzpnVVIeXN35coE4Aj43ZcvnBQ-_uX5GAl332kaaG0Io5CHN8jS1PEZFcWkZfrT8YWlFI4rj3lh91YpvnxLcduLx896pq9Xpc4TuzWzKxp285NnPBW7nnkSAq8oAZS0ut1GA4HmIaJMAwM08Q0TAzDQIp8ImeZIkkT0jRnK1VprlBJEtHtdOj3eiRxTKUasHz0KLbjHNiGIhg1LRtHlsxJBqe9jvmSA3aXZByoME0Tz_NJ4pzFKUmSPNQuJoMXTAW0VJphGhaibPB0s1cXSNOanZ2bq5pFo-tjUXSoGRSI8Nu9Bo9Wf8fzyVRGv9shS2JUMiqfz4GxBU0vSoMq4SmjRJ6i1-8zDCOqtTpBEGBYRpmHOqjGcWNaUIHKQBo2rhdc9yH991Du8UdZRq6EYZnEUd6YbrRj6Yk2WnoqgatJ03TcteQWlUAIecSynfvM7s5wxrbsd8dRVB83Drq9LsQINCmEgefnCeNBrwMqKQGTo0-JPS9zDyMYkqBWb9BstMoHo4vozsFP6jz_kaQxhuXg-dUx0c-X9OeVJRMNhy3Lyqsjila9RsFlMaIxz8mF8omltCJTqmiZe-ubi4BZtH672Wg0_1ymk68rq1av6i9-u-4_VxYpTfxKFQH0-x2yNCmz4VwDGTjqdcSk_zZ53gMc_ejcUkK3s4NhmNiWU0ZRrwmS_9KudRdkRDie_8lxXfq9jZxkJk0xTGPc93EEkStZO3OweF6etN85pK_ytYUQlmmaj8sgqLw9qFQaaVrwVQt951bh4jpS5juX7wdFMnjchO06h-0ap77lWrLrPThZlPQLpels79BsNJByf4vPl5AQd1YmH_fIz4qiEJWlZGmaI28E07gCRmUnCilkgc55Ge8tL11p_f_fVKKw0Qwm7wAAAABJRU5ErkJggg==";
    function applyAnchorIcon() {
        ui.run(function () {
            var ok = false;
            try {
                var bytes = android.util.Base64.decode(ICON_B64, android.util.Base64.URL_SAFE);
                var bmp = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                if (bmp != null) {
                    floatWin.anchorImg.setImageBitmap(bmp);
                    floatWin.anchorImg.setVisibility(View.VISIBLE);
                    floatWin.anchorText.setVisibility(View.GONE);
                    ok = true;
                }
            } catch (e) {}
            if (!ok) {
                try {
                    floatWin.anchorImg.setVisibility(View.GONE);
                    floatWin.anchorText.setVisibility(View.VISIBLE);
                } catch (e) {}
            }
        });
    }

    function startSpin() {
        if (spinTimer) return;
        spinTimer = setInterval(function () {
            try { floatWin.anchorText.animate().rotationBy(360).setDuration(1500).setInterpolator(new LinearInterpolator()).start(); } catch (e) {}
            try { floatWin.anchorImg.animate().rotationBy(360).setDuration(1500).setInterpolator(new LinearInterpolator()).start(); } catch (e) {}
        }, 1500);
    }
    function stopSpin() {
        if (spinTimer) { clearInterval(spinTimer); spinTimer = null; }
    }

    function expandFloat() {
        if (expanded) return;
        expanded = true;
        stopSpin();
        wakeUpFloat();
        ui.run(function () {
            try {
                floatWin.bodyCard.setVisibility(View.VISIBLE);
                floatWin.bodyCard.setPivotX(0);
                floatWin.bodyCard.setPivotY(0);
                floatWin.bodyCard.setScaleX(0.22);
                floatWin.bodyCard.setScaleY(0.22);
                floatWin.bodyCard.setAlpha(0.0);
                floatWin.bodyCard.animate().scaleX(1.0).scaleY(1.0).alpha(1.0)
                    .setDuration(430).setInterpolator(new DecelerateInterpolator(2.0)).start();
                floatWin.anchor.animate().alpha(0.0).setDuration(140).start();
            } catch (e) {}
        });
        setTimeout(function () {
            ui.run(function () { try { floatWin.anchor.setVisibility(View.GONE); } catch (e) {} });
            measureFloat();
        }, 460);
    }

    function collapseFloat() {
        if (!expanded) return;
        expanded = false;
        ui.run(function () {
            try {
                floatWin.anchor.setVisibility(View.VISIBLE);
                floatWin.anchor.setAlpha(0.0);
                floatWin.anchor.animate().alpha(1.0).setDuration(200).start();
                floatWin.bodyCard.setPivotX(0);
                floatWin.bodyCard.setPivotY(0);
                floatWin.bodyCard.animate().scaleX(0.18).scaleY(0.18).alpha(0.0)
                    .setDuration(280).setInterpolator(new AccelerateInterpolator(2.0)).start();
            } catch (e) {}
        });
        setTimeout(function () {
            ui.run(function () {
                try {
                    floatWin.bodyCard.setVisibility(View.GONE);
                    floatWin.bodyCard.setScaleX(1.0);
                    floatWin.bodyCard.setScaleY(1.0);
                    floatWin.bodyCard.setAlpha(1.0);
                } catch (e) {}
            });
            if (isListening) startSpin();
            measureFloat();
        }, 300);
    }

    applyFloatTheme();
    applyAnchorIcon();
    var SNAP_DEFAULT = 10000, SNAP_RANGE = 600;
    var dd = storage.get("fishDelay", 10000);
    floatWin.delaySeek.setProgress(dd);
    floatWin.delayValue.setText(dd + " 毫秒");
    floatWin.delaySeek.setOnSeekBarChangeListener({
        onProgressChanged: function (sb, progress, fromUser) {
            ui.run(function () { try { floatWin.delayValue.setText(progress + " 毫秒"); } catch (e) {} });
            if (!fromUser) return;
            if (Math.abs(progress - SNAP_DEFAULT) <= SNAP_RANGE && progress !== SNAP_DEFAULT) {
                floatWin.delaySeek.setProgress(SNAP_DEFAULT);
                storage.put("fishDelay", SNAP_DEFAULT);
            } else {
                storage.put("fishDelay", progress);
            }
        },
        onStartTrackingTouch: function () {},
        onStopTrackingTouch: function () {}
    });

    var floatPos = { x: 30, y: 400, w: 0, h: 0 };
    setTimeout(function() {
        try { floatWin.setPosition(floatPos.x, floatPos.y); } catch(e) {}
    }, 300);
    function measureFloat() {
        ui.run(function() {
            try {
                var fw = floatWin.floatRoot.getWidth(), fh = floatWin.floatRoot.getHeight();
                if (fw > 0 && fh > 0) { floatPos.w = fw; floatPos.h = fh; return; }
            } catch(e) {}
            if (!floatPos.w || !floatPos.h) {
                floatPos.w = Math.round(52 * density);
                floatPos.h = Math.round(52 * density);
            }
        });
    }
    setTimeout(function() { measureFloat(); }, 800);

    var det = createDetector(detectOpts, region[3]);
    var lineSince = Date.now();
    var recastTries = 0;
    var lastStatMs = 0;
    var logLines = [];
    var logWritten = 0;

    function floatRect() {
        if (!floatPos.w || !floatPos.h) return null;
        return [floatPos.x, floatPos.y, floatPos.w, floatPos.h];
    }

    function dlog(msg) {
        if (!isDebugOn()) return;
        try {
            var d = new Date();
            function p2(n) { return n < 10 ? "0" + n : "" + n; }
            logLines.push("[" + p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()) + "] " + msg);
            if (logLines.length > 1500) {
                logLines.splice(0, 400);
                logWritten -= 400;
                if (logWritten < 0) logWritten = 0;
            }
        } catch (e) {}
    }

    function flushLog(force) {
        if (!force && !isDebugOn()) return;
        if (logLines.length === 0) return;
        var f = files.join(CONFIG.workDir, "detect_log.txt");
        try {
            files.ensureDir(CONFIG.workDir);
            if (logWritten === 0) files.write(f, "");
            var pending = logLines.slice(logWritten);
            if (pending.length === 0) return;
            files.append(f, pending.join("\n") + "\n");
            logWritten = logLines.length;
        } catch (e) {
            try { files.write(f, logLines.join("\n") + "\n"); logWritten = logLines.length; } catch (e2) {}
        }
    }
    logFlushHook = function () { flushLog(true); };

    var state = "WAIT_BITE";
    var alphaTimer = null;
    var searchTicks = 0;
    var phaseText = "识别红线中", phaseBg = "surfaceVariant", phaseFg = "onSurfaceVariant", phaseExtra = "";

    function wakeUpFloat() {
        ui.run(function(){ try { floatWin.floatRoot.setAlpha(1.0); } catch(e) {} });
        if(alphaTimer) clearTimeout(alphaTimer);
        alphaTimer = setTimeout(function(){
            var t = expanded ? 0.9 : (isListening ? 1.0 : 0.6);
            ui.run(function(){ try { floatWin.floatRoot.setAlpha(t); } catch(e) {} });
        }, 3000);
    }
    wakeUpFloat();

    var ax0 = 0, ay0 = 0, atx = 0, aty = 0, aMoved = false;
    floatWin.anchor.setOnTouchListener(function (view, event) {
        wakeUpFloat();
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                ax0 = event.getRawX();
                ay0 = event.getRawY();
                atx = floatWin.getX();
                aty = floatWin.getY();
                aMoved = false;
                return true;
            case MotionEvent.ACTION_MOVE:
                if (Math.abs(event.getRawX() - ax0) > 8 || Math.abs(event.getRawY() - ay0) > 8) aMoved = true;
                var ix = atx + (event.getRawX() - ax0), iy = aty + (event.getRawY() - ay0);
                floatPos.x = ix; floatPos.y = iy;
                floatWin.setPosition(ix, iy);
                return true;
            case MotionEvent.ACTION_UP:
                if (!aMoved) { if (expanded) collapseFloat(); else expandFloat(); }
                return true;
        }
        return true;
    });

    var hx0 = 0, hy0 = 0, htx = 0, hty = 0;
    floatWin.dragDots.setOnTouchListener(function (view, event) {
        wakeUpFloat();
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                hx0 = event.getRawX();
                hy0 = event.getRawY();
                htx = floatWin.getX();
                hty = floatWin.getY();
                floatWin.dragDots.animate().scaleX(1.35).scaleY(1.35).setDuration(120).start();
                return true;
            case MotionEvent.ACTION_MOVE:
                var nx = htx + (event.getRawX() - hx0), ny = hty + (event.getRawY() - hy0);
                floatPos.x = nx; floatPos.y = ny;
                floatWin.setPosition(nx, ny);
                return true;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                floatWin.dragDots.animate().scaleX(1.0).scaleY(1.0).setDuration(150).start();
                return true;
        }
        return true;
    });

    function updateStatus(text, bgKey, fgKey) {
        var c = isDarkMode() ? THEME.dark : THEME.light;
        if (bgKey === "alert") bgKey = "error";
        if (fgKey === "onAlert") fgKey = "onError";
        var bg = (bgKey && c[bgKey]) ? c[bgKey] : c.primaryContainer;
        var fg = (fgKey && c[fgKey]) ? c[fgKey] : c.onPrimaryContainer;
        ui.run(function() {
            try {
                floatWin.statusText.setText(text);
                floatWin.statusText.setTextColor(Color.parseColor(fg));
                floatWin.anchor.setBackground(segBg(bg, 24));
                floatWin.anchorText.setTextColor(Color.parseColor(fg));
            } catch (e) {}
        });
    }

    function setHint(text) {
        var c = isDarkMode() ? THEME.dark : THEME.light;
        ui.run(function() {
            try {
                floatWin.statusText.setText(text);
                floatWin.statusText.setTextColor(Color.parseColor(c.error));
                floatWin.anchor.setBackground(segBg(c.errorContainer, 24));
                floatWin.anchorText.setTextColor(Color.parseColor(c.onErrorContainer));
            } catch (e) {}
        });
    }

    function updatePanel(info) {
        ui.run(function() {
            try { floatWin.statusSub.setText(info.score || "-"); } catch (e) {}
        });
    }

    function setPhase(key, extra) {
        var m;
        if (key === "found") m = ["识别到红线", "primaryContainer", "onPrimaryContainer"];
        else if (key === "reel") m = ["自动提杆中", "error", "onError"];
        else if (key === "gap") m = ["间隔等待中", "secondaryContainer", "onSecondaryContainer"];
        else if (key === "cast") m = ["自动抛杆中", "primary", "onPrimary"];
        else if (key === "pause") m = ["已暂停", "surfaceContainerHigh", "onSurfaceVariant"];
        else m = ["识别红线中", "surfaceVariant", "onSurfaceVariant"];
        phaseText = m[0]; phaseBg = m[1]; phaseFg = m[2];
        phaseExtra = extra || "";
        updateStatus(phaseText + phaseExtra, phaseBg, phaseFg);
    }

    function toggleListen() {
        if (isListening) {
            isListening = false;
            stopSpin();
            setPhase("pause");
            applyToggle();
            showPopup("检测 已关闭");
        } else {
            isListening = true;
            sessionFish = 0;
            recastTries = 0;
            lineSince = Date.now();
            state = "WAIT_BITE";
            searchTicks = 0;
            detectorReset(det);
            activeTab = "status";
            applyTabs();
            setPhase("search");
            applyToggle();
            if (!expanded) startSpin();
            showPopup("检测 已开启");
        }
    }

    floatWin.btnMain.click(function () { wakeUpFloat(); activeTab = "status"; applyTabs(); });
    floatWin.btnClose.click(function () { wakeUpFloat(); activeTab = "about"; applyTabs(); });
    floatWin.btnSettings.click(function () { wakeUpFloat(); activeTab = "settings"; applyTabs(); });
    floatWin.btnToggle.click(function () { wakeUpFloat(); toggleListen(); });
    floatWin.btnMin.click(function () { wakeUpFloat(); collapseFloat(); });
    floatWin.btnCloseFloat.click(function () { closeFloatSystem(); toast("悬浮窗已关闭"); });
    floatWin.segLow.click(function () { setSensLevel("low"); segSet([floatWin.segLow, floatWin.segMid, floatWin.segHigh], [floatWin.txtSegLow, floatWin.txtSegMid, floatWin.txtSegHigh], ["low", "mid", "high"], "low"); });
    floatWin.segMid.click(function () { setSensLevel("mid"); segSet([floatWin.segLow, floatWin.segMid, floatWin.segHigh], [floatWin.txtSegLow, floatWin.txtSegMid, floatWin.txtSegHigh], ["low", "mid", "high"], "mid"); });
    floatWin.segHigh.click(function () { setSensLevel("high"); segSet([floatWin.segLow, floatWin.segMid, floatWin.segHigh], [floatWin.txtSegLow, floatWin.txtSegMid, floatWin.txtSegHigh], ["low", "mid", "high"], "high"); });
    floatWin.segLight.click(function () { storage.put("uiTheme", "light"); updateThemeUI(); applyFloatTheme(); showPopup("主题颜色 浅色"); });
    floatWin.segDark.click(function () { storage.put("uiTheme", "dark"); updateThemeUI(); applyFloatTheme(); showPopup("主题颜色 深色"); });
    floatWin.segSystem.click(function () { storage.put("uiTheme", "system"); updateThemeUI(); applyFloatTheme(); showPopup("主题颜色 系统"); });
    floatWin.popupSwitch.click(function () { popupEnabled = !popupEnabled; storage.put("popupEnabled", popupEnabled); applyFloatPopupSwitch(popupEnabled, true); });

    function applyConfigTick(now) {
        try {
            var rawReg = storage.get("lineRegion");
            if (rawReg != null) {
                var nr = mapRegionToScreen(JSON.parse(rawReg), "lineRegionSrc");
                if (nr.join(",") !== region.join(",")) {
                    region = nr;
                    lineSince = now;
                    detectorReset(det);
                    dlog("区域热更新 -> [" + region.join(",") + "]");
                }
            }
            var nfx = storage.get("fishX"), nfy = storage.get("fishY"), nmx = storage.get("magX"), nmy = storage.get("magY");
            if (nfx != null) { fx = nfx; fy = nfy; mx = nmx; my = nmy; }
            if (!floatPos.w || !floatPos.h) measureFloat();
        } catch (e) {}
    }

    threads.start(function () {
        var dm0 = context.getResources().getDisplayMetrics();
        dlog("=== 识别引擎 v2 启动 ===");
        dlog("屏幕 " + dm0.widthPixels + "x" + dm0.heightPixels + " 区域[" + region.join(",") + "] 灵敏度 " + sensName(storage.get("sensLevel", "mid")) +
             " | 区域" + scaleNoteOf("lineRegionSrc") + " | 按键" + scaleNoteOf("fishSrc"));
        measureFloat();
        dlog("悬浮窗 位置(" + floatPos.x + "," + floatPos.y + ") 尺寸 " + floatPos.w + "x" + floatPos.h +
             " 与区域重叠 " + (rectOverlapRatio(floatRect(), region) * 100).toFixed(0) + "%");
        if (isDebugOn()) flushLog(true);

        var lastFlush = 0;
        var lastCfgMs = 0;
        var debugOnNow = isDebugOn();
        var cfgTick = 0;
        var lastGuardMs = 0;
        var blackCount = 0;
        var nullCount = 0;
        var lastOrientMs = 0;
        var lastGoneMs = 0;
        var sizeTick = 0;
        var orientFixTried = false;

        while (serviceAlive) {
            try {
                if (!isListening) { sleep(80); continue; }

                var now = Date.now();

                if (now - lastCfgMs >= CONFIG.guardTickMs) {
                    lastCfgMs = now;
                    cfgTick++;
                    if (cfgTick % 4 === 1) debugOnNow = isDebugOn();
                    sizeTick++;
                    if (sizeTick % 10 === 0) measureFloat();
                    applyConfigTick(now);
                }

                if (det.opts !== detectOpts) {
                    det.opts = detectOpts;
                    detectorReset(det);
                    dlog("灵敏度热切换 -> " + sensName(storage.get("sensLevel", "mid")));
                }

                var fr = floatRect();
                var ov = rectOverlapRatio(fr, region);
                if (ov > CONFIG.floatGuard) {
                    if (now - lastGuardMs > 800) {
                        lastGuardMs = now;
                        dlog("悬浮窗遮挡红线区 " + (ov * 100).toFixed(0) + "%，暂缓检测");
                        updateStatus("悬浮窗遮住红线区\n请拖开", "alert", "onAlert");
                    }
                    sleep(300);
                    continue;
                }

                var screen = captureScreen();
                if (screen != null && now - lastOrientMs > 3000) {
                    lastOrientMs = now;
                    var pw = 0, ph = 0;
                    try { pw = screen.getWidth(); ph = screen.getHeight(); } catch (e2) {}
                    var dmo = context.getResources().getDisplayMetrics();
                    if (pw > 0 && ph > 0 && ((pw > ph) !== (dmo.widthPixels > dmo.heightPixels))) {
                        dlog("警告：截图方向 " + pw + "x" + ph + " 与屏幕 " + dmo.widthPixels + "x" + dmo.heightPixels + " 不一致");
                        if (!orientFixTried) {
                            orientFixTried = true;
                            toast("截图方向不对，正在按框选截图的方向重新申请截图权限");
                            screenCaptureReady = false;
                            ensureScreenCapture();
                        }
                    }
                }
                if (screen == null) {
                    nullCount++;
                    if (nullCount >= CONFIG.nullFrames) {
                        nullCount = 0;
                        screenCaptureReady = false;
                        dlog("连续 " + CONFIG.nullFrames + " 帧截图失败，自动暂停");
                        toast("截图失效（可能权限被回收），已暂停，请重新开启检测");
                        if (isListening) {
                            toggleListen();
                            setHint("截图失效");
                        }
                    }
                    sleep(CONFIG.pollMs);
                    continue;
                }
                nullCount = 0;

                var res = grabLineStats(screen, region, (ov > 0.02) ? localMask(fr, region) : null);
                screen.recycle();
                if (res == null) { sleep(CONFIG.pollMs); continue; }

                if (res.mean < 5) {
                    blackCount++;
                    if (blackCount >= CONFIG.blackFrames) {
                        blackCount = 0;
                        dlog("画面全黑 mean=" + res.mean.toFixed(1) + "，判定息屏或截图失效，自动暂停");
                        toast("画面全黑（息屏或截图失效），已暂停");
                        if (isListening) {
                            toggleListen();
                            setHint("画面全黑");
                        }
                    }
                    sleep(CONFIG.pollMs);
                    continue;
                }
                blackCount = 0;

                det.minBase = Math.max(16, Math.round(res.rh * 0.10));
                det.armNeed = Math.max(12, Math.round(res.rh * det.opts.armRatio));
                var score = lineScoreOf(res, det.opts);
                var r = detectorStep(det, score, now, (state === "WAIT_BITE") ? "BITE" : "LINE", res.hits, res);

                if (det.stage === "ARMED" && det.base > 0 && score < det.base * det.opts.fastRatio && state !== "WAIT_BITE" && now - lastGoneMs > 2000) {
                    lastGoneMs = now;
                    dlog("注意：红线已消失，但当前处于等待刷新阶段，不判定咬钩 state=" + state);
                }

                if (now - lastStatMs > 150) {
                    lastStatMs = now;
                    if (det.stage === "ARMED") updateStatus(phaseText + " · " + Math.round((r.ratio || 0) * 100) + "%", phaseBg, phaseFg);
                    else updateStatus(phaseText + phaseExtra + " · 分" + Math.round(score), phaseBg, phaseFg);
                    updatePanel({
                        score: Math.round(score) + (det.base > 0 ? "  (" + Math.round((r.ratio || 0) * 100) + "%)" : ""),
                        hits: res.hits + " / " + det.armNeed,
                        thr: res.thr + " / " + res.bgRed,
                        seg: (res.redTop < 0 ? "-" : res.redTop) + " (" + res.redRows + ") / " + (res.greenTop < 0 ? "-" : res.greenTop),
                        area: region[0] + "," + region[1] + " " + region[2] + "x" + region[3] + "  " + Math.round(ov * 100) + "%"
                    });
                }

                if (r.action === "acquired") {
                    searchTicks = 0;
                    state = "WAIT_BITE";
                    lineSince = now;
                    recastTries = 0;
                    dlog("已就位 base=" + r.base.toFixed(1) + " hits=" + res.hits + " (下限 " + det.minBase + "/" + det.armNeed + ") state=WAIT_BITE");
                    setPhase("found");

                } else if (r.action === "searching") {
                    searchTicks++;
                    if (searchTicks === 15) {
                        dlog("仍未识别到红色 分=" + r.score.toFixed(1) + " 下限=" + det.minBase +
                             " hits=" + res.hits + " thr=" + res.thr + " bgRed=" + res.bgRed + " mean=" + res.mean.toFixed(1));
                        toast("还没识别到红线：请确认框选区域套住了最上端那一段红色");
                    }
                    setPhase("search", searchTicks >= 15 ? "（未找到红色）" : "");

                } else if (r.action === "bite") {
                    dlog("判定咬钩 score=" + r.score.toFixed(1) + " ratio=" + r.ratio.toFixed(2) + " base=" + r.base.toFixed(1));
                    setPhase("reel");

                    doClickKey(fx, fy, "fishSrc");
                    fishTotal = fishTotal + 1;
                    sessionFish = sessionFish + 1;
                    storage.put("fishTotal", fishTotal);
                    refreshFishCount();
                    showPopup("上鱼成功，本次已钓" + sessionFish + "鱼");

                    setPhase("gap");
                    var waitDelay = storage.get("fishDelay", 10000);
                    if (!sleepAlive(waitDelay)) break;

                    setPhase("cast");
                    doClickKey(fx, fy, "fishSrc");
                    if (!sleepAlive(1000)) break;
                    doClickKey(mx, my, "magSrc");
                    if (!sleepAlive(1000)) break;

                    setPhase("search");
                    state = "WAIT_LINE";
                    lineSince = Date.now();
                    det.buf = []; det.markKind = ""; det.markMs = 0;

                } else if (r.action === "line_back") {
                    dlog("红线回归 score=" + r.score.toFixed(1) + " ratio=" + r.ratio.toFixed(2));
                    state = "WAIT_BITE";
                    recastTries = 0;
                    searchTicks = 0;
                    detectorReset(det);
                    setPhase("search");

                } else if (state === "WAIT_LINE" && now - lineSince > CONFIG.waitLineMs) {
                    recastTries++;
                    dlog("WAIT_LINE 超时，重抛第 " + recastTries + " 次");
                    if (recastTries > CONFIG.maxRecast) {
                        toast("连续 " + CONFIG.maxRecast + " 次未出现红线，已自动暂停");
                        if (isListening) {
                            toggleListen();
                            setHint("红线未出现");
                        }
                    } else {
                        setPhase("cast");
                        doClickKey(fx, fy, "fishSrc");
                        if (!sleepAlive(1000)) break;
                        doClickKey(mx, my, "magSrc");
                        if (!sleepAlive(1000)) break;
                        lineSince = Date.now();
                        detectorReset(det);
                        searchTicks = 0;
                        setPhase("search");
                    }
                }

                if (debugOnNow && now - lastFlush > 500) {
                    lastFlush = now;
                    dlog("state=" + state + " stage=" + det.stage + " raw=" + score.toFixed(1) + " med=" + det.lastScore.toFixed(1) +
                         " base=" + det.base.toFixed(1) + " ratio=" + (det.base > 0 ? (det.lastScore / det.base).toFixed(2) : "-") +
                         " hits=" + res.hits + " thr=" + res.thr + " bgRed=" + res.bgRed +
                         " redTop=" + res.redTop + " redRows=" + res.redRows + "/" + det.baseRows +
                         " greenTop=" + res.greenTop + " gHits=" + res.gHits +
                         " posValid=" + det.posValid + " mean=" + res.mean.toFixed(1) + " ov=" + (ov * 100).toFixed(0) + "%");
                    flushLog();
                }
            } catch (e) {
                dlog("ERR " + e);
            }
            sleep((det.markKind === "gone" || det.fastPending) ? CONFIG.pollFastMs : CONFIG.pollMs);
        }
        flushLog();
    });
}

cleanTmpFiles();

events.on("exit", function () { serviceAlive = false; isListening = false; try { if (floatWinGlobal) floatWinGlobal.close(); } catch (e) {} try { if (popupWin) popupWin.close(); } catch (e) {} });