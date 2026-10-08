// js/dashboard.js

let currentUser = null;
let selectedStatus = 'active'; // ค่าเริ่มต้นสถานะสคริปต์

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

    // 2. ควบคุมปุ่มเมนู 3 ขีด (Hamburger Menu)
    const btnMenu = document.getElementById('btn-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (btnMenu && dropdownMenu) {
        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // คลิกพื้นที่อื่นเพื่อปิดเมนู
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

    // 4. ควบคุมปุ่ม Segmented Control (สถานะสคริปต์)
    const segmentBtns = document.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            segmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedStatus = btn.getAttribute('data-status');
        });
    });

    // 5. ควบคุมป๊อปอัปออกจากระบบ (Modal Overlay)
    const btnLogoutMenu = document.getElementById('btn-logout-menu');
    const logoutModal = document.getElementById('logout-modal');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');

    if (btnLogoutMenu && logoutModal) {
        btnLogoutMenu.addEventListener('click', () => {
            if (dropdownMenu) dropdownMenu.classList.remove('show'); // ปิดดรอปดาวน์
            logoutModal.style.display = 'flex'; // แสดงป๊อปอัปยืนยัน
        });
    }

    if (btnModalCancel && logoutModal) {
        btnModalCancel.addEventListener('click', () => {
            logoutModal.style.display = 'none'; // ปิดป๊อปอัปเมื่อยกเลิก
        });
    }

    if (btnModalConfirm) {
        btnModalConfirm.addEventListener('click', async () => {
            if (window.supabaseClient) {
                await window.supabaseClient.auth.signOut();
                window.location.href = "auth.html"; // ออกจากระบบและกลับไปหน้าแรก
            }
        });
    }

    // 6. ปุ่มยืนยันสร้างสคริปต์
    const btnCreate = document.getElementById('btn-create');
    if (btnCreate) {
        btnCreate.addEventListener('click', async () => {
            const nameInput = document.getElementById('script-name').value.trim();
            const codeInput = document.getElementById('script-code').value.trim();
            const hasPassword = togglePassword ? togglePassword.checked : false;
            const passwordInput = document.getElementById('script-password').value.trim();

            if (!nameInput || !codeInput) {
                alert('⚠️ กรุณากรอกชื่อสคริปต์และโค้ด Lua ให้ครบถ้วน!');
                return;
            }

            if (hasPassword && !passwordInput) {
                alert('⚠️ กรุณากรอกรหัสผ่านด้วยครับ!');
                return;
            }

            btnCreate.disabled = true;
            btnCreate.textContent = "⏳ กำลังสร้างสคริปต์...";

            const scriptId = generate25DigitId();

            try {
                const { error } = await window.supabaseClient
                    .from('scripts')
                    .insert([
                        {
                            id: scriptId,
                            user_id: currentUser ? currentUser.id : null,
                            script_name: nameInput,
                            script_code: codeInput,
                            has_password: hasPassword,
                            password: hasPassword ? passwordInput : null,
                            status: selectedStatus
                        }
                    ]);

                btnCreate.disabled = false;
                btnCreate.textContent = "✨ ยืนยันสร้าง link script";

                if (error) {
                    alert('❌ เกิดข้อผิดพลาด: ' + error.message);
                } else {
                    const generatedLink = `loadstring(game:HttpGet("https://adminmonntshop-prog.github.io/script-upload/${scriptId}/raw/main.lua"))()`;
                    
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

// ฟังก์ชันสุ่ม Script ID ตัวเลข 25 หลัก
function generate25DigitId() {
    let id = "";
    for (let i = 0; i < 25; i++) {
        id += Math.floor(Math.random() * 10).toString();
    }
    return id;
}
