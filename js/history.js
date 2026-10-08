ต่อกันที่ **ขั้นตอนที่ 8: เขียนสคริปต์ดึงประวัติมาแสดงและจัดการสคริปต์ (`js/history.js`)** ครับ!
// js/history.js

let currentUser = null;

// 1. ตรวจสอบ Session การเข้าสู่ระบบ
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = "auth.html";
        return;
    }
    currentUser = session.user;
    loadUserScripts();
}

checkAuth();

// 2. ปุ่ม ออกจากระบบ (Logout)
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = "auth.html";
    });
}

// 3. โหลดรายการสคริปต์ของผู้ใช้คนนี้
async function loadUserScripts() {
    const container = document.getElementById('script-list-container');
    if (!container) return;

    // ดึงสคริปต์เฉพาะของผู้ใช้คนนี้ (RLS จะช่วยกรองอีกชั้น)
    const { data: scripts, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = `<p class="status-msg">❌ เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}</p>`;
        return;
    }

    if (!scripts || scripts.length === 0) {
        container.innerHTML = '<p class="empty-text">📂 คุณยังไม่มีสคริปต์ที่สร้างไว้ในระบบ</p>';
        return;
    }

    container.innerHTML = ''; // ล้างข้อความกำลังโหลด

    scripts.forEach(script => {
        const scriptCard = document.createElement('div');
        scriptCard.className = 'script-item-card';

        const loadstringCode = `loadstring(game:HttpGet("https://adminmonntshop-prog.github.io/script-upload/${script.id}/raw/main.lua"))()`;
        
        // คำนวณวันหมดอายุประวัติ (7 วันนับจากวันที่สร้าง/อัปเดต)
        const createdDate = new Date(script.created_at);
        const now = new Date();
        const daysPassed = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 7 - daysPassed);

        scriptCard.innerHTML = `
            <div class="script-header">
                <h3>${escapeHtml(script.script_name)}</h3>
                <span class="badge-pwd">${script.has_password ? '🔒 มีรหัสผ่าน' : '🔓 ไม่มีรหัสผ่าน'}</span>
            </div>
            <p class="script-id-text"><strong>Script ID:</strong> <code>${script.id}</code></p>
            <p class="script-date">📅 สร้างเมื่อ: ${createdDate.toLocaleString('th-TH')}</p>
            <p class="script-history-info">⏱️ ประวัติการแก้ไขบันทึกไว้คงเหลือ: <strong>${daysRemaining} วัน</strong> (ตัวสคริปต์และลิงก์จะอยู่ถาวร)</p>

            <div class="form-group" style="margin-top: 10px;">
                <div class="copy-input-group">
                    <input type="text" value="${escapeHtml(loadstringCode)}" readonly id="input-${script.id}">
                    <button class="btn-copy" onclick="copyLoadstring('${script.id}')">📋 คัดลอก</button>
                </div>
            </div>

            <div class="action-buttons">
                <a href="edit.html?id=${script.id}" class="btn-edit">✏️ แก้ไขสคริปต์</a>
                <button class="btn-delete" onclick="deleteScript('${script.id}')">🗑️ ลบสคริปต์</button>
            </div>
        `;

        container.appendChild(scriptCard);
    });
}

// ฟังก์ชันคัดลอกคำสั่ง Loadstring
window.copyLoadstring = function(id) {
    const input = document.getElementById(`input-${id}`);
    if (input) {
        input.select();
        navigator.clipboard.writeText(input.value);
        alert('📋 คัดลอกคำสั่ง Loadstring เรียบร้อยแล้ว!');
    }
};

// ฟังก์ชันลบสคริปต์
window.deleteScript = async function(id) {
    if (!confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบสคริปต์นี้? (สคริปต์และลิงก์จะถูกลบถาวรทันที)')) {
        return;
    }

    const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

    if (error) {
        alert('❌ เกิดข้อผิดพลาดในการลบ: ' + error.message);
    } else {
        alert('✅ ลบสคริปต์เรียบร้อยแล้ว!');
        loadUserScripts(); // โหลดรายการใหม่
    }
};

function escapeHtml(text) {
    return text
        ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        : '';
}
