// js/dashboard.js

let currentUser = null;
let selectedStatus = 'active';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // 1. ตรวจสอบการเข้าสู่ระบบ
    if (window.supabaseClient) {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) {
                window.location.href = "auth.html";
                return;
            }
            currentUser = session.user;
        } catch (err) {
            console.error("Auth check error:", err);
            window.location.href = "auth.html";
            return;
        }
    }

    // 2. ปุ่มเมนู 3 ขีด (Hamburger Menu)
    const btnMenu = document.getElementById('btn-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (btnMenu && dropdownMenu) {
        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && e.target !== btnMenu) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // 3. ควบคุมสวิตช์เปิด-ปิดรหัสผ่าน
    const togglePassword = document.getElementById('toggle-password');
    const passwordBox = document.getElementById('password-input-box');

    if (togglePassword && passwordBox) {
        togglePassword.addEventListener('change', () => {
            passwordBox.style.display = togglePassword.checked ? 'block' : 'none';
        });
    }

    // 4. ควบคุม Segmented Control (สถานะสคริปต์)
    const segmentBtns = document.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            segmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedStatus = btn.getAttribute('data-status');
        });
    });

    // 5. ป๊อปอัปออกจากระบบ (Modal Overlay)
    const btnLogoutMenu = document.getElementById('btn-logout-menu');
    const logoutModal = document.getElementById('logout-modal');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');

    if (btnLogoutMenu && logoutModal) {
        btnLogoutMenu.addEventListener('click', () => {
            if (dropdownMenu) dropdownMenu.classList.remove('show');
            logoutModal.style.display = 'flex';
        });
    }

    if (btnModalCancel && logoutModal) {
        btnModalCancel.addEventListener('click', () => {
            logoutModal.style.display = 'none';
        });
    }

    if (btnModalConfirm) {
        btnModalConfirm.addEventListener('click', async () => {
            if (window.supabaseClient) {
                await window.supabaseClient.auth.signOut();
                window.location.href = "auth.html";
            }
        });
    }

    // 6. ปุ่มยืนยันสร้างสคริปต์
    const btnCreate = document.getElementById('btn-create');
    const toggleKeySystem = document.getElementById('toggle-key-system');

    if (btnCreate) {
        btnCreate.addEventListener('click', async () => {
            const nameInput = document.getElementById('script-name').value.trim();
            const rawCodeInput = document.getElementById('script-code').value.trim();
            const hasPassword = togglePassword ? togglePassword.checked : false;
            const passwordInput = document.getElementById('script-password').value.trim();
            const hasKeySystem = toggleKeySystem ? toggleKeySystem.checked : false;

            if (!nameInput || !rawCodeInput) {
                alert('⚠️ กรุณากรอกชื่อสคริปต์และโค้ด Lua ให้ครบถ้วน!');
                return;
            }

            if (hasPassword && !passwordInput) {
                alert('⚠️ กรุณากรอกรหัสผ่านด้วยครับ!');
                return;
            }

            btnCreate.disabled = true;
            btnCreate.textContent = "⏳ กำลังสร้างและฝังระบบ...";

            const scriptId = generate25DigitId();
            const keySystemUrl = "https://adminmonntshop-prog.github.io/Monnt-Hub-Key/";

            // ========================================================
            // ⚡ ประกอบร่างโค้ด Lua ตามลำดับ: 🔑 Key System -> 🔒 Password -> 🚀 Main Script
            // ========================================================
            let compiledLuaCode = rawCodeInput;

            // 1. ถ้าเปิดรหัสผ่าน -> ครอบโค้ดหลักก่อน
            if (hasPassword) {
                const safePassword = passwordInput.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                compiledLuaCode = `
-- ==========================================
-- 🔒 STEP 2: PASSWORD VERIFICATION
-- ==========================================
local TARGET_PASSWORD = "${safePassword}"
local passwordVerified = false

local CoreGui = game:GetService("CoreGui")
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "MonntPasswordUI"
ScreenGui.Parent = CoreGui

local MainFrame = Instance.new("Frame")
MainFrame.Size = UDim2.new(0, 320, 0, 180)
MainFrame.Position = UDim2.new(0.5, -160, 0.5, -90)
MainFrame.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
MainFrame.BorderSizePixel = 0
MainFrame.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 12)
UICorner.Parent = MainFrame

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, 0, 0, 40)
Title.Text = "🔒 กรุณาใส่รหัสผ่าน"
Title.TextColor3 = Color3.fromRGB(37, 99, 235)
Title.Font = Enum.Font.SourceSansBold
Title.TextSize = 18
Title.BackgroundTransparency = 1
Title.Parent = MainFrame

local InputBox = Instance.new("TextBox")
InputBox.Size = UDim2.new(0.85, 0, 0, 36)
InputBox.Position = UDim2.new(0.075, 0, 0.3, 0)
InputBox.PlaceholderText = "กรอกรหัสผ่านที่นี่..."
InputBox.Text = ""
InputBox.TextColor3 = Color3.fromRGB(15, 23, 42)
InputBox.BackgroundColor3 = Color3.fromRGB(241, 245, 249)
InputBox.Font = Enum.Font.SourceSans
InputBox.TextSize = 14
InputBox.Parent = MainFrame

local BoxCorner = Instance.new("UICorner")
BoxCorner.CornerRadius = UDim.new(0, 8)
BoxCorner.Parent = InputBox

local SubmitBtn = Instance.new("TextButton")
SubmitBtn.Size = UDim2.new(0.85, 0, 0, 38)
SubmitBtn.Position = UDim2.new(0.075, 0, 0.62, 0)
SubmitBtn.Text = "เข้าสู่ระบบ"
SubmitBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
SubmitBtn.BackgroundColor3 = Color3.fromRGB(37, 99, 235)
SubmitBtn.Font = Enum.Font.SourceSansBold
SubmitBtn.TextSize = 15
SubmitBtn.Parent = MainFrame

local BtnCorner = Instance.new("UICorner")
BtnCorner.CornerRadius = UDim.new(0, 8)
BtnCorner.Parent = SubmitBtn

SubmitBtn.MouseButton1Click:Connect(function()
    if InputBox.Text == TARGET_PASSWORD then
        passwordVerified = true
        ScreenGui:Destroy()
    else
        InputBox.Text = ""
        InputBox.PlaceholderText = "❌ รหัสผ่านไม่ถูกต้อง!"
    end
end)

repeat task.wait(0.5) until passwordVerified

-- 🚀 MAIN LUA SCRIPT EXECUTION
${compiledLuaCode}
`;
            }

            // 2. ถ้าเปิดระบบคีย์ -> ครอบอยู่นอกสุด (ทำงานก่อนรหัสผ่านเสมอ)
            if (hasKeySystem) {
                compiledLuaCode = `
-- ==========================================
-- 🔑 STEP 1: KEY SYSTEM VERIFICATION
-- ==========================================
local KEY_URL = "${keySystemUrl}"
local keyVerified = false

local CoreGui = game:GetService("CoreGui")
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "MonntKeyUI"
ScreenGui.Parent = CoreGui

local MainFrame = Instance.new("Frame")
MainFrame.Size = UDim2.new(0, 340, 0, 200)
MainFrame.Position = UDim2.new(0.5, -170, 0.5, -100)
MainFrame.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
MainFrame.BorderSizePixel = 0
MainFrame.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 12)
UICorner.Parent = MainFrame

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, 0, 0, 40)
Title.Text = "🔑 ระบบยืนยัน Key System"
Title.TextColor3 = Color3.fromRGB(37, 99, 235)
Title.Font = Enum.Font.SourceSansBold
Title.TextSize = 18
Title.BackgroundTransparency = 1
Title.Parent = MainFrame

local KeyInput = Instance.new("TextBox")
KeyInput.Size = UDim2.new(0.85, 0, 0, 36)
KeyInput.Position = UDim2.new(0.075, 0, 0.25, 0)
KeyInput.PlaceholderText = "กรอก Key ที่ได้จากเว็บ..."
KeyInput.Text = ""
KeyInput.TextColor3 = Color3.fromRGB(15, 23, 42)
KeyInput.BackgroundColor3 = Color3.fromRGB(241, 245, 249)
KeyInput.Font = Enum.Font.SourceSans
KeyInput.TextSize = 14
KeyInput.Parent = MainFrame

local BoxCorner = Instance.new("UICorner")
BoxCorner.CornerRadius = UDim.new(0, 8)
BoxCorner.Parent = KeyInput

local GetKeyBtn = Instance.new("TextButton")
GetKeyBtn.Size = UDim2.new(0.4, 0, 0, 36)
GetKeyBtn.Position = UDim2.new(0.075, 0, 0.55, 0)
GetKeyBtn.Text = "📋 คัดลอกลิงก์เก็ตคีย์"
GetKeyBtn.TextColor3 = Color3.fromRGB(37, 99, 235)
GetKeyBtn.BackgroundColor3 = Color3.fromRGB(239, 246, 255)
GetKeyBtn.Font = Enum.Font.SourceSansBold
GetKeyBtn.TextSize = 13
GetKeyBtn.Parent = MainFrame

local GetKeyCorner = Instance.new("UICorner")
GetKeyCorner.CornerRadius = UDim.new(0, 8)
GetKeyCorner.Parent = GetKeyBtn

local VerifyBtn = Instance.new("TextButton")
VerifyBtn.Size = UDim2.new(0.42, 0, 0, 36)
VerifyBtn.Position = UDim2.new(0.505, 0, 0.55, 0)
VerifyBtn.Text = "✅ ตรวจสอบคีย์"
VerifyBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
VerifyBtn.BackgroundColor3 = Color3.fromRGB(37, 99, 235)
VerifyBtn.Font = Enum.Font.SourceSansBold
VerifyBtn.TextSize = 13
VerifyBtn.Parent = MainFrame

local VerifyCorner = Instance.new("UICorner")
VerifyCorner.CornerRadius = UDim.new(0, 8)
VerifyCorner.Parent = VerifyBtn

GetKeyBtn.MouseButton1Click:Connect(function()
    if setclipboard then
        setclipboard(KEY_URL)
    end
    GetKeyBtn.Text = "คัดลอกเรียบร้อย!"
    task.wait(2)
    GetKeyBtn.Text = "📋 คัดลอกลิงก์เก็ตคีย์"
end)

VerifyBtn.MouseButton1Click:Connect(function()
    if #KeyInput.Text > 0 then
        keyVerified = true
        ScreenGui:Destroy()
    else
        KeyInput.Text = ""
        KeyInput.PlaceholderText = "❌ กรุณากรอกคีย์!"
    end
end)

repeat task.wait(0.5) until keyVerified

-- NEXT STEP EXECUTION (PASSWORD & MAIN SCRIPT):
${compiledLuaCode}
`;
            }

            try {
                const { error } = await window.supabaseClient
                    .from('scripts')
                    .insert([
                        {
                            id: scriptId,
                            user_id: currentUser ? currentUser.id : null,
                            script_name: nameInput,
                            script_code: compiledLuaCode,
                            has_password: hasPassword,
                            password: hasPassword ? passwordInput : null,
                            has_key_system: hasKeySystem,
                            key_url: hasKeySystem ? keySystemUrl : null,
                            status: selectedStatus
                        }
                    ]);

                btnCreate.disabled = false;
                btnCreate.textContent = "✨ ยืนยันสร้าง link script";

                if (error) {
                    alert('❌ เกิดข้อผิดพลาด: ' + error.message);
                } else {
                    const generatedLink = `loadstring(game:HttpGet("https://adminmonntshop-prog.github.io/Monnt-hub-upload-script-/${scriptId}/raw/main.lua"))()`;
                    
                    document.getElementById('display-script-link').textContent = generatedLink;
                    document.getElementById('result-box').style.display = 'block';

                    document.getElementById('btn-copy-link').onclick = () => {
                        navigator.clipboard.writeText(generatedLink);
                        alert('📋 คัดลอกลิงก์สคริปต์เรียบร้อยแล้ว!');
                    };
                }
            } catch (err) {
                btnCreate.disabled = false;
                btnCreate.textContent = "✨ ยืนยันสร้าง link script";
                alert('❌ เกิดข้อผิดพลาด: ' + err.message);
            }
        });
    }
}

function generate25DigitId() {
    let id = "";
    for (let i = 0; i < 25; i++) {
        id += Math.floor(Math.random() * 10).toString();
    }
    return id;
}
