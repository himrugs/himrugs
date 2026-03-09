/* 
    HimRugs Admin Dashboard - Firebase Integration
    Handles customer requests and messages
*/

// ========== FIREBASE CONFIGURATION ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    Timestamp,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSMb64fq5XeISSu6hykGR3d2LCLGPRg18",
    authDomain: "himrugs.firebaseapp.com",
    projectId: "himrugs",
    storageBucket: "himrugs.firebasestorage.app",
    messagingSenderId: "25546216518",
    appId: "1:25546216518:web:8fa18c9d292d042d71e647",
    measurementId: "G-LM5RY32285"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log('✅ Firebase initialized successfully');

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 Admin Dashboard initializing...');
    
    initTabs();
    initFormHandlers();
    initFilterButtons();
    initSearchBar();
    initClearAllButton();
    initConfirmDialog();
    
    // Initial load
    await refreshDashboard();
    
    // Auto-refresh every 10 seconds
    setInterval(refreshDashboard, 10000);
    
    console.log('✅ Admin Dashboard ready!');
});


// ========== TAB SWITCHING ==========
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active from all tabs and forms
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.form-content').forEach(f => f.classList.remove('active'));
            
            // Add active to clicked tab and corresponding form
            this.classList.add('active');
            document.querySelector(`[data-form="${tabName}"]`).classList.add('active');
        });
    });
}


// ========== FORM HANDLERS ==========
function initFormHandlers() {
    const designForm = document.getElementById('customDesignForm');
    const messageForm = document.getElementById('sendMessageForm');
    
    if (designForm) {
        designForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitDesignForm(designForm);
        });
    }
    
    if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitMessageForm(messageForm);
        });
    }
}

// Submit Design Request
async function submitDesignForm(form) {
    const fullname = form.querySelector('[name="fullname"]')?.value.trim() || '';
    const contact = form.querySelector('[name="contact"]')?.value.trim() || '';
    const email = form.querySelector('[name="email"]')?.value.trim() || '';
    const address = form.querySelector('[name="address"]')?.value.trim() || '';
    
    // Validate
    if (!fullname || !contact || !email || !address) {
        showAlert('❌ Please fill all required fields', 'error');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('❌ Please enter a valid email address', 'error');
        return;
    }
    
    try {
        await addDoc(collection(db, 'customerRequests'), {
            type: 'design',
            fullname: fullname,
            contact: contact,
            email: email,
            address: address,
            timestamp: Timestamp.now(),
            createdAt: new Date().toLocaleString('en-IN')
        });
        
        form.reset();
        showAlert('✅ Design request submitted successfully!', 'success');
        
        setTimeout(() => refreshDashboard(), 500);
    } catch (error) {
        console.error('Design submit error:', error);
        showAlert('❌ Error: ' + error.message, 'error');
    }
}

// Submit Message Form
async function submitMessageForm(form) {
    const fullname = form.querySelector('[name="fullname"]')?.value.trim() || '';
    const contact = form.querySelector('[name="contact"]')?.value.trim() || '';
    const email = form.querySelector('[name="email"]')?.value.trim() || '';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';
    
    // Validate
    if (!fullname || !contact || !email || !message) {
        showAlert('❌ Please fill all required fields', 'error');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('❌ Please enter a valid email address', 'error');
        return;
    }
    
    try {
        await addDoc(collection(db, 'customerRequests'), {
            type: 'message',
            fullname: fullname,
            contact: contact,
            email: email,
            message: message,
            timestamp: Timestamp.now(),
            createdAt: new Date().toLocaleString('en-IN')
        });
        
        form.reset();
        showAlert('✅ Message sent successfully!', 'success');
        
        setTimeout(() => refreshDashboard(), 500);
    } catch (error) {
        console.error('Message submit error:', error);
        showAlert('❌ Error: ' + error.message, 'error');
    }
}


// ========== DATA OPERATIONS ==========
async function getAllRequests() {
    try {
        const snapshot = await getDocs(
            query(
                collection(db, 'customerRequests'),
                orderBy('timestamp', 'desc')
            )
        );
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            type: doc.data().type,
            fullname: doc.data().fullname || '',
            contact: doc.data().contact || '',
            email: doc.data().email || '',
            address: doc.data().address || '',
            message: doc.data().message || '',
            createdAt: doc.data().createdAt || 'N/A',
            status: doc.data().status || 'new'
        }));
    } catch (error) {
        console.error('Fetch error:', error);
        showAlert('❌ Error loading requests: ' + error.message, 'error');
        return [];
    }
}


// ========== DISPLAY FUNCTIONS ==========
async function loadRequests(filterType = 'all', searchTerm = '') {
    const requests = await getAllRequests();
    const container = document.getElementById('requestsContainer');
    
    // Filter by type
    let filtered = requests;
    if (filterType !== 'all') {
        filtered = requests.filter(r => r.type === filterType);
    }
    
    // Filter by search term
    if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(r => 
            r.fullname.toLowerCase().includes(search) ||
            r.email.toLowerCase().includes(search) ||
            r.contact.toLowerCase().includes(search)
        );
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Show empty state
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-icon">📋</p>
                <p class="empty-text">No requests found</p>
                <p class="empty-subtext">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    // Display each request
    filtered.forEach(req => {
        const icon = req.type === 'design' ? '🎨' : '💬';
        const label = req.type === 'design' ? 'Design Request' : 'Message';
        const detail = req.type === 'design' ? req.address : req.message;
        const statusIcon = req.status === 'resolved' ? '✅' : '🆕';
        
        const card = document.createElement('div');
        card.className = 'request-card';
        card.setAttribute('data-request-id', req.id);
        card.innerHTML = `
            <div class="request-header">
                <div class="request-type-status">
                    <span class="request-type ${req.type}">${icon} ${label}</span>
                    <span class="status-badge ${req.status}">${statusIcon} ${req.status === 'resolved' ? 'Resolved' : 'New'}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-action btn-expand" data-request-id="${req.id}">👁️ View</button>
                    ${req.status !== 'resolved' ? `<button class="btn-action btn-resolve" data-request-id="${req.id}">✓ Resolve</button>` : ''}
                    <button class="btn-action btn-delete" data-request-id="${req.id}">🗑️ Delete</button>
                </div>
            </div>
            <div class="request-info">
                <strong>👤 Name:</strong>
                <span>${escapeHtml(req.fullname)}</span>
            </div>
            <div class="request-info">
                <strong>📱 Contact:</strong>
                <span>${escapeHtml(req.contact)}</span>
            </div>
            <div class="request-info">
                <strong>📧 Email:</strong>
                <span>${escapeHtml(req.email)}</span>
            </div>
            <div class="request-details" data-request-id="${req.id}">
                <div class="request-info">
                    <strong>${req.type === 'design' ? '📍 Full Address' : '💬 Full Message'}:</strong>
                    <div class="detail-full">${escapeHtml(detail)}</div>
                </div>
            </div>
            <div class="request-timestamp">📅 ${req.createdAt}</div>
        `;
        container.appendChild(card);
    });
    
    // Attach event listeners to action buttons
    attachActionListeners();
}

// Update Statistics
async function updateStats() {
    const requests = await getAllRequests();
    
    const totalStats = document.getElementById('totalStats');
    const designStats = document.getElementById('designStats');
    const messageStats = document.getElementById('messageStats');
    
    if (totalStats) totalStats.textContent = requests.length;
    if (designStats) designStats.textContent = requests.filter(r => r.type === 'design').length;
    if (messageStats) messageStats.textContent = requests.filter(r => r.type === 'message').length;
}


// ========== FILTER BUTTONS ==========
function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Load filtered data
            const filterType = this.getAttribute('data-filter');
            const searchTerm = document.getElementById('searchInput')?.value || '';
            await loadRequests(filterType, searchTerm);
        });
    });
    
    // Export CSV Button
    const exportBtn = document.getElementById('exportCSVBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            await exportToCSV();
        });
    }
}

// ========== SEARCH BAR ==========
function initSearchBar() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', async function() {
            const searchTerm = this.value;
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
            await loadRequests(activeFilter, searchTerm);
        });
    }
}

// ========== CLEAR ALL BUTTON ==========
function initClearAllButton() {
    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async function() {
            showConfirmDialog('Are you sure you want to delete ALL requests? This action cannot be undone.', async () => {
                const requests = await getAllRequests();
                try {
                    for (const req of requests) {
                        await deleteDoc(doc(db, 'customerRequests', req.id));
                    }
                    showAlert('✅ All requests deleted successfully!', 'success');
                    await refreshDashboard();
                } catch (error) {
                    console.error('Clear all error:', error);
                    showAlert('❌ Error deleting requests: ' + error.message, 'error');
                }
            });
        });
    }
}

// ========== CONFIRM DIALOG ==========
let confirmCallback = null;

function initConfirmDialog() {
    const confirmYesBtn = document.getElementById('confirmYes');
    const confirmNoBtn = document.getElementById('confirmNo');
    
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback();
                confirmCallback = null;
            }
            hideConfirmDialog();
        });
    }
    
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', hideConfirmDialog);
    }
}

function showConfirmDialog(message, callback) {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = document.getElementById('confirmMessage');
    
    if (messageEl) messageEl.textContent = message;
    confirmCallback = callback;
    
    if (dialog) {
        dialog.classList.remove('hidden');
    }
}

function hideConfirmDialog() {
    const dialog = document.getElementById('confirmDialog');
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

// ========== ACTION BUTTON HANDLERS ==========
function attachActionListeners() {
    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            showConfirmDialog('Are you sure you want to delete this request?', async () => {
                await deleteRequest(requestId);
            });
        });
    });
    
    // Expand/View buttons
    document.querySelectorAll('.btn-expand').forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            const detailsEl = document.querySelector(`.request-details[data-request-id="${requestId}"]`);
            if (detailsEl) {
                detailsEl.classList.toggle('expanded');
                this.textContent = detailsEl.classList.contains('expanded') ? '👁️ Hide' : '👁️ View';
            }
        });
    });
    
    // Resolve buttons
    document.querySelectorAll('.btn-resolve').forEach(btn => {
        btn.addEventListener('click', async function() {
            const requestId = this.getAttribute('data-request-id');
            showConfirmDialog('Mark this request as resolved?', async () => {
                await markAsResolved(requestId);
            });
        });
    });
}

// ========== DELETE REQUEST ==========
async function deleteRequest(requestId) {
    try {
        await deleteDoc(doc(db, 'customerRequests', requestId));
        showAlert('✅ Request deleted successfully!', 'success');
        await refreshDashboard();
    } catch (error) {
        console.error('Delete error:', error);
        showAlert('❌ Error deleting request: ' + error.message, 'error');
    }
}

// ========== MARK AS RESOLVED ==========
async function markAsResolved(requestId) {
    try {
        await updateDoc(doc(db, 'customerRequests', requestId), {
            status: 'resolved'
        });
        showAlert('✅ Request marked as resolved!', 'success');
        await refreshDashboard();
    } catch (error) {
        console.error('Resolve error:', error);
        showAlert('❌ Error updating request: ' + error.message, 'error');
    }
}


// ========== REFRESH DASHBOARD ==========
async function refreshDashboard() {
    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
    const searchTerm = document.getElementById('searchInput')?.value || '';
    await loadRequests(activeFilter, searchTerm);
    await updateStats();
}


// ========== UTILITY FUNCTIONS ==========
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    
    if (type === 'success') {
        alertDiv.style.cssText = `
            background: #d1fae5;
            border: 2px solid #6ee7b7;
            color: #065f46;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;
    } else {
        alertDiv.style.cssText = `
            background: #fee2e2;
            border: 2px solid #fca5a5;
            color: #991b1b;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;
    }
    
    alertDiv.textContent = message;
    
    const panel = document.querySelector('.form-panel');
    if (panel) {
        const tabs = panel.querySelector('.form-tabs');
        if (tabs) {
            tabs.parentNode.insertBefore(alertDiv, tabs.nextSibling);
        }
    }
    
    setTimeout(() => alertDiv.remove(), 5000);
}

// Export to CSV
async function exportToCSV() {
    const requests = await getAllRequests();
    
    if (requests.length === 0) {
        alert('No data to export');
        return;
    }
    
    let csv = 'Type,Name,Contact,Email,Details,Date\n';
    
    requests.forEach(r => {
        const type = r.type === 'design' ? 'Design Request' : 'Message';
        const detail = r.type === 'design' ? r.address : r.message;
        const escapedDetail = `"${detail.replace(/"/g, '""')}"`;
        
        csv += `${type},"${r.fullname}","${r.contact}","${r.email}",${escapedDetail},"${r.createdAt}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HimRugs_Requests_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    console.log('✅ CSV exported successfully');
}

console.log('%c✅ HimRugs Admin Dashboard Ready!', 'color: green; font-weight: bold; font-size: 14px;');
