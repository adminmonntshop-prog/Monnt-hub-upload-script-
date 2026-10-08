ต่อกันที่ **ขั้นตอนที่ 9: หน้าแก้ไขสคริปต์ `edit.html` และ `js/edit.js`** ครับ!

หน้านี้จะใช้สำหรับโหลดข้อมูลสคริปต์เดิมขึ้นมาแก้ไข โดยที่ **Script ID (ตัวเลขยาว 25 หลัก) จะยังเป็นเลขเดิมถาวร** และเมื่อกดบันทึก ระบบจะแอบบันทึกประวัติการเปลี่ยนแปลง (`old_code` ➔ `new_code`) ลงในตารางประวัติเพื่อย้อนดู/เปรียบเทียบได้ภายใน 7 วันครับ

---

### 📍 ขั้นตอนที่ 9.1: สร้างไฟล์ `edit.html`

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monnt Hub - Edit Script</title>
    <link rel="stylesheet" href="css/style.css">
    <!-- ดึง Supabase Library -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <div class="dashboard-container">
        <!-- แถบด้านบน -->
        <header class="top-bar">
            <h1>✏️ แก้ไขสคริปต์</h1>
            <div class="user-info">
                <a href="history.html" class="btn-nav">⬅️ กลับไปหน้าประวัติ</a>
                <button id="btn-logout" class="btn-logout">ออกจากระบบ</button>
            </div>
        </header>

        <main class="main-content">
            <div class="card">
                <h2>📝 แก้ไขโค้ดและข้อมูลสคริปต์</h2>
                <p class="script-id-text"><strong>Script ID ถาวร:</strong> <code id="display-script-id">กำลังโหลด...</code></p>
                
                <div class="form-group" style="margin-top: 15px;">
                    <label for="edit-script-name">ชื่อสคริปต์:</label>
                    <input type="text" id="edit-script-name" placeholder="ชื่อสคริปต์..." required>
                </div>

                <div class="form-group">
                    <label for="edit-script-code">เนื้อหาโค้ดสคริปต์ (Lua Code):</label>
                    <textarea id="edit-script-code" rows="12" placeholder="วางโค้ด Lua ใหม่ที่นี่..." required></textarea>
                </div>

                <!-- ตัวเลือกตั้งรหัสผ่าน -->
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="edit-toggle-password">
                    <label for="edit-toggle-password">🔒 ต้องการเปิดใช้งานรหัสผ่านล็อกสคริปต์ในเกมไหม?</label>
                </div>

                <div class="form-group" id="edit-password-input-box" style="display: none;">
                    <label for="edit-script-password">กำหนดรหัสผ่านใหม่:</label>
                    <input type="text" id="edit-script-password" placeholder="กรอกรหัสผ่านที่ต้องการ...">
                </div>

                <button id="btn-update" class="btn-primary">💾 บันทึกการอัปเดตสคริปต์</button>
            </div>
        </main>
    </div>

    <!-- ดึงไฟล์ตั้งค่าและสคริปต์ควบคุมหน้า Edit -->
    <script src="js/supabase-config.js"></script>
    <script src="js/edit.js"></script>
</body>
</html>
```

---

### 📍 ขั้นตอนที่ 9.2: สร้างไฟล์ `js/edit.js`

สร้างไฟล์ชื่อ **`edit.js`** ในโฟลเดอร์ **`js`** แล้วคัดลอกโค้ดนี้ไปวางได้เลยครับ:

```javascript
// js/edit.js

let currentUser = null;
let targetScriptId = null;
let originalCode = "";

// 1. ดึง ID จาก URL Parameter (เช่น edit.html?id=710117815201...)
const urlParams = new URLSearchParams(window.location.search);
targetScriptId = urlParams.get('id');

// 2. ตรวจสอบการเข้าสู่ระบบ
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = "auth.html";
        return;
    }
    currentUser = session.user;

    if (!targetScriptId) {
        alert("⚠️ ไม่พบรหัส Script ID ที่ต้องการแก้ไข");
        window.location.href = "history.html";
        return;
    }

    loadScriptData();
}

checkAuth();

// 3. ปุ่ม ออกจากระบบ (Logout)
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = "auth.html";
    });
}

// 4. โหลดข้อมูลสคริปต์เดิม
async function loadScriptData() {
    const { data: script, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', targetScriptId)
        .eq('user_id', currentUser.id)
        .single();

    if (error || !script) {
        alert("❌ ไม่สามารถดึงข้อมูลสคริปต์ได้ หรือคุณไม่มีสิทธิ์แก้ไขสคริปต์นี้");
        window.location.href = "history.html";
        return;
    }

    // แสดงผลข้อมูลเดิมบน Form
    document.getElementById('display-script-id').textContent = script.id;
    document.getElementById('edit-script-name').value = script.script_name;
    document.getElementById('edit-script-code').value = script.script_code;

    originalCode = script.script_code; // บันทึกโค้ดเดิมไว้ลงประวัติ

    const togglePassword = document.getElementById('edit-toggle-password');
    const passwordBox = document.getElementById('edit-password-input-box');
    const passwordInput = document.getElementById('edit-script-password');

    if (script.has_password) {
        togglePassword.checked = true;
        passwordBox.style.display = 'block';
        passwordInput.value = script.password || '';
    }

    togglePassword.addEventListener('change', () => {
        passwordBox.style.display = togglePassword.checked ? 'block' : 'none';
    });
}

// 5. ปุ่มบันทึกการอัปเดต
const btnUpdate = document.getElementById('btn-update');
if (btnUpdate) {
    btnUpdate.addEventListener('click', async () => {
        const nameInput = document.getElementById('edit-script-name').value.trim();
        const newCodeInput = document.getElementById('edit-script-code').value.trim();
        const hasPassword = document.getElementById('edit-toggle-password').checked;
        const passwordInput = document.getElementById('edit-script-password').value.trim();

        if (!nameInput || !newCodeInput) {
            alert('⚠️ กรุณากรอกชื่อและเนื้อหาโค้ดสคริปต์!');
            return;
        }

        if (hasPassword && !passwordInput) {
            alert('⚠️ กรุณากรอกรหัสผ่านด้วยครับ!');
            return;
        }

        btnUpdate.disabled = true;
        btnUpdate.textContent = "⏳ กำลังบันทึกข้อมูล...";

        // ก) บันทึกประวัติการแก้ไขลงในตาราง script_history (ลบอัตโนมัติใน 7 วัน)
        if (originalCode !== newCodeInput) {
            await supabase.from('script_history').insert([
                {
                    script_id: targetScriptId,
                    user_id: currentUser.id,
                    old_code: originalCode,
                    new_code: newCodeInput
                }
            ]);
        }

        // ข) อัปเดตตารางหลัก scripts (ID เดิมถาวร)
        const { error } = await supabase
            .from('scripts')
            .update({
                script_name: nameInput,
                script_code: newCodeInput,
                has_password: hasPassword,
                password: hasPassword ? passwordInput : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', targetScriptId)
            .eq('user_id', currentUser.id);

        btnUpdate.disabled = false;
        btnUpdate.textContent = "💾 บันทึกการอัปเดตสคริปต์";

        if (error) {
            alert('❌ เกิดข้อผิดพลาดในการอัปเดต: ' + error.message);
        } else {
            alert('✅ อัปเดตสคริปต์เรียบร้อยแล้ว! ลิงก์เดิมยังคงใช้งานได้ปกติ');
            window.location.href = "history.html";
        }
    });
}
