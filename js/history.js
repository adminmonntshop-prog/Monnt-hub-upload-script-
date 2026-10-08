// js/history.js - Complete & Updated

const MAIN_SUPABASE_URL = "https://ulsujpqrdesndmuksqkr.supabase.co";
const MAIN_SUPABASE_ANON_KEY = "sb_publishable_mMHZfdWQC_8jaIQi40QLww_cJJI6scB";

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    setupUIEvents();
    checkAuthAndLoad();
});

function setupUIEvents() {
    const btnMenu = document.getElementById('btn-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (btnMenu && dropdownMenu) {
        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = dropdownMenu.style.display === 'none' || !dropdownMenu.classList.contains('show');
            if (isHidden) {
                dropdownMenu.style.display = 'flex';
                dropdownMenu.classList.add('show');
            } else {
                dropdownMenu.style.display = 'none';
                dropdownMenu.classList.remove('show');
            }
        });

        document.addEventListener('click', (e) => {
            if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== btnMenu) {
                dropdownMenu.style.display = 'none';
                dropdownMenu.classList.remove('show');
            }
        });
    }

    const btnLogoutMenu = document.getElementById('btn-logout-menu');
    const logoutModal = document.getElementById('logout-modal');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');

    if (btnLogoutMenu && logoutModal) {
        btnLogoutMenu.addEventListener('click', () => {
            if (dropdownMenu) {
                dropdownMenu.style.display = 'none';
                dropdownMenu.classList.remove('show');
            }
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
}

async function checkAuthAndLoad() {
    if (window.supabaseClient) {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) {
                window.location.href = "auth.html";
                return;
            }
            currentUser = session.user;
            loadUserScripts();
        } catch (err) {
            console.error("Auth check error:", err);
            window.location.href = "auth.html";
        }
    }
}

async function loadUserScripts() {
    const listContainer = document.getElementById('history-list-container');
    const scriptCountEl = document.getElementById('script-count');

    if (!listContainer) return;

    listContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">⏳ กำลังโหลดประวัติสคริปต์...</p>';

    try {
        const { data: scripts, error } = await window.supabaseClient
            .from('scripts')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) {
            listContainer.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 20px;">❌ โหลดข้อมูลไม่สำเร็จ: ${error.message}</p>`;
            return;
        }

        if (scriptCountEl) {
            scriptCountEl.textContent = `พบ ${scripts ? scripts.length : 0} Script`;
        }

        if (!scripts || scripts.length === 0) {
            listContainer.innerHTML = `
                <div class="clean-card" style="text-align: center; padding: 40px 20px;">
                    <p style="font-size: 2rem; margin-bottom: 10px;">📜</p>
                    <h3 style="color: #0f172a; margin-bottom: 6px;">ยังไม่มีประวัติสคริปต์</h3>
                    <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 16px;">คุณยังไม่ได้สร้างสคริปต์ใดๆ ในระบบ</p>
                    <a href="dashboard.html" class="btn-primary-blue" style="display: inline-block; width: auto; text-decoration: none; padding: 10px 20px;">➕ สร้างสคริปต์ใหม่</a>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';
        scripts.forEach(item => {
            const card = document.createElement('div');
            card.className = 'script-card-item';

            let statusBadge = '<span class="status-pill active">🟢 เปิดใช้งาน</span>';
            if (item.status === 'maintenance') {
                statusBadge = '<span class="status-pill maintenance">🟠 ปรับปรุง</span>';
            } else if (item.status === 'disabled') {
                statusBadge = '<span class="status-pill disabled">🔴 ปิดใช้งาน</span>';
            }

            const passBadge = item.has_password 
                ? '<span class="tag-pill-blue">🔒 มีรหัสผ่าน</span>' 
                : '<span class="tag-pill-blue" style="background: #f1f5f9; color: #64748b;">🔓 ไม่มีรหัสผ่าน</span>';

            const keyBadge = item.has_key_system
                ? '<span class="tag-pill-blue" style="background: #fef3c7; color: #b45309;">🔑 ใช้ระบบคีย์</span>'
                : '';

            const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่';
            
            // ⚡ ลิงก์ loadstring แบบดึงตรงจาก Supabase REST API
            const loadstringUrl = `loadstring(game:GetService("HttpService"):JSONDecode(game:HttpGet("${MAIN_SUPABASE_URL}/rest/v1/scripts?id=eq.${item.id}&select=script_code&apikey=${MAIN_SUPABASE_ANON_KEY}"))[1].script_code)()`;

            card.innerHTML = `
                <div class="card-top-tags">
                    ${statusBadge}
                    ${passBadge}
                    ${keyBadge}
                </div>
                <h3 class="script-item-title">${escapeHtml(item.script_name)}</h3>
                <div class="script-item-meta">
                    <span>🆔 ID: ${item.id}</span>
                    <span>📅 ${createdDate}</span>
                </div>
                <div class="script-item-code-preview">
                    <code>${escapeHtml(item.script_code.substring(0, 100))}${item.script_code.length > 100 ? '...' : ''}</code>
                </div>
                <div class="card-action-btns">
                    <button class="btn-card-primary btn-copy" data-link="${escapeHtml(loadstringUrl)}">
                        📋 คัดลอกลิงก์
                    </button>
                    <button class="btn-card-danger btn-delete" data-id="${item.id}">
                        🗑️ ลบ
                    </button>
                </div>
            `;

            listContainer.appendChild(card);
        });

        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const link = btn.getAttribute('data-link');
                navigator.clipboard.writeText(link);
                alert('📋 คัดลอกลิงก์สคริปต์เรียบร้อยแล้ว!');
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const scriptId = btn.getAttribute('data-id');
                if (confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบสคริปต์นี้?')) {
                    const { error } = await window.supabaseClient
                        .from('scripts')
                        .delete()
                        .eq('id', scriptId);

                    if (error) {
                        alert('❌ ไม่สามารถลบสคริปต์ได้: ' + error.message);
                    } else {
                        alert('🗑️ ลบสคริปต์เรียบร้อยแล้ว!');
                        loadUserScripts();
                    }
                }
            });
        });

    } catch (err) {
        listContainer.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 20px;">❌ เกิดข้อผิดพลาด: ${err.message}</p>`;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}
