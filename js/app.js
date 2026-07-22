// ===== SHOW ADD PRODUCT with IMAGE UPLOAD =====
function showAddProduct() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="form-container" id="formContainer">
            <h2>${editingProductId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>
            <form id="productForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label>اسم المنتج <span class="required">*</span></label>
                    <input type="text" id="title" required placeholder="مثال: باب خشبي فاخر">
                </div>
                <div class="form-group">
                    <label>السعر ($) <span class="required">*</span></label>
                    <input type="number" id="price" required placeholder="500" step="0.01">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>الفئة</label>
                        <select id="category">
                            <option value="أبواب">أبواب</option>
                            <option value="شبابيك">شبابيك</option>
                            <option value="مطابخ">مطابخ</option>
                            <option value="غرف نوم">غرف نوم</option>
                            <option value="ألمنيوم">ألمنيوم</option>
                            <option value="ديكورات">ديكورات</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>الغرفة</label>
                        <select id="room">
                            <option value="صالة">صالة</option>
                            <option value="غرفة نوم">غرفة نوم</option>
                            <option value="مطبخ">مطبخ</option>
                            <option value="حمام">حمام</option>
                            <option value="حديقة">حديقة</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>اللون</label>
                        <input type="text" id="color" placeholder="بني ذهبي">
                    </div>
                    <div class="form-group">
                        <label>الخامة</label>
                        <input type="text" id="material" placeholder="خشب">
                    </div>
                </div>
                <div class="form-group">
                    <label>العلامة التجارية</label>
                    <input type="text" id="brand" placeholder="اسم المصنع">
                </div>
                <div class="form-row">
                    <div class="form-group"><label>الطول (سم)</label><input type="number" id="length" placeholder="210"></div>
                    <div class="form-group"><label>العرض (سم)</label><input type="number" id="width" placeholder="90"></div>
                    <div class="form-group"><label>الارتفاع (سم)</label><input type="number" id="height" placeholder="4"></div>
                </div>
                <div class="form-group">
                    <label>الوصف</label>
                    <textarea id="description" rows="4" placeholder="وصف المنتج..."></textarea>
                </div>
                
                <!-- ===== صورة المنتج (رفع من الجهاز) ===== -->
                <div class="form-group">
                    <label>صور المنتج (اختر من جهازك) <span class="required">*</span></label>
                    <input type="file" id="imageInput" accept="image/*" multiple>
                    <small style="color:#888;">يمكنك اختيار عدة صور (حد أقصى 5)</small>
                    <div id="imagePreview" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;"></div>
                </div>

                <div class="form-group">
                    <label>حالة المنتج</label>
                    <select id="condition">
                        <option value="جديد">جديد</option>
                        <option value="مستعمل">مستعمل</option>
                        <option value="للطلب">للطلب</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-submit">${editingProductId ? '💾 تحديث' : '📤 نشر'}</button>
                    <button type="button" class="btn btn-cancel" onclick="editingProductId=null;showHome();">إلغاء</button>
                </div>
            </form>
        </div>
    `;

    // ===== معاينة الصور عند الاختيار =====
    const fileInput = document.getElementById('imageInput');
    const preview = document.getElementById('imagePreview');
    let selectedFiles = [];

    fileInput.addEventListener('change', function(e) {
        preview.innerHTML = '';
        selectedFiles = Array.from(this.files);
        if (selectedFiles.length > 5) {
            showToast('⚠️ يمكنك اختيار 5 صور كحد أقصى', 'error');
            this.value = '';
            selectedFiles = [];
            return;
        }
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = document.createElement('img');
                img.src = ev.target.result;
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '10px';
                img.style.border = '2px solid var(--gold)';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // ===== معالجة الإرسال =====
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // جمع البيانات النصية
        const productData = {
            title: document.getElementById('title').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            category: document.getElementById('category').value,
            room: document.getElementById('room').value,
            color: document.getElementById('color').value.trim(),
            material: document.getElementById('material').value.trim(),
            brand: document.getElementById('brand').value.trim(),
            description: document.getElementById('description').value.trim(),
            dimensions: {
                length: parseFloat(document.getElementById('length').value) || 0,
                width: parseFloat(document.getElementById('width').value) || 0,
                height: parseFloat(document.getElementById('height').value) || 0
            },
            condition: document.getElementById('condition').value,
            currency: 'USD',
            updatedAt: new Date()
        };

        if (!productData.title) return showToast('❌ أدخل اسم المنتج', 'error');
        if (!productData.price || productData.price <= 0) return showToast('❌ أدخل سعراً صحيحاً', 'error');
        if (selectedFiles.length === 0 && !editingProductId) return showToast('❌ اختر صوراً للمنتج', 'error');

        try {
            const btn = document.querySelector('.btn-submit');
            btn.textContent = '⏳ جاري الرفع...';
            btn.disabled = true;

            // ===== رفع الصور إلى Firebase Storage =====
            let imageUrls = [];
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(storageRef);
                    imageUrls.push(url);
                }
            } else if (editingProductId) {
                // في حالة التعديل، احتفظ بالصور القديمة إذا لم يتم رفع جديدة
                const oldDoc = await getDoc(doc(db, 'products', editingProductId));
                if (oldDoc.exists()) {
                    imageUrls = oldDoc.data().images || [];
                }
            }

            productData.images = imageUrls;

            if (editingProductId) {
                await updateDoc(doc(db, 'products', editingProductId), productData);
                showToast('✅ تم التحديث بنجاح!', 'success');
                editingProductId = null;
            } else {
                productData.createdAt = new Date();
                productData.isNew = true;
                productData.featured = false;
                productData.views = 0;
                await addDoc(collection(db, 'products'), productData);
                showToast('✅ تم النشر بنجاح!', 'success');
            }
            showHome();
        } catch (err) {
            console.error(err);
            showToast('❌ حدث خطأ: ' + err.message, 'error');
            const btn = document.querySelector('.btn-submit');
            btn.textContent = editingProductId ? '💾 تحديث' : '📤 نشر';
            btn.disabled = false;
        }
    });

    // في حالة التعديل، قم بتحميل البيانات وعرض الصور القديمة
    if (editingProductId) {
        loadProductData(editingProductId);
    }

    setTimeout(() => document.getElementById('formContainer')?.classList.add('fade-in'), 50);
}