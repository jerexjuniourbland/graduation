const $ = id => document.getElementById(id);

let students = JSON.parse(localStorage.getItem("graduate_students_v1") || "[]");
let cropper = null;
let croppedImageData = "";
let originalImageData = "";

function saveData(){
  localStorage.setItem("graduate_students_v1", JSON.stringify(students));
  alert("Taarifa zimehifadhiwa kwenye browser hii.");
}

function resetForm(){
  $("studentForm").reset();
  $("editIndex").value = "-1";
  $("formTitle").textContent = "Ongeza Mhitimu";
  $("submitBtn").textContent = "➕ Add Mhitimu";
  $("editingBadge").classList.add("hidden");
  croppedImageData = "";
  originalImageData = "";
  $("photoPreview").src = "";
  $("photoPreview").classList.add("empty");
  $("photoPlaceholder").style.display = "block";
  $("photoInput").value = "";
  $("cropBtn").disabled = true;
}

function editStudent(index){
  const s = students[index];
  $("editIndex").value = index;
  $("name").value = s.name || "";
  $("place").value = s.place || "";
  $("subject").value = s.subject || "";
  $("dream").value = s.dream || "";
  croppedImageData = s.photo || "";
  originalImageData = s.photo || "";
  if(s.photo){
    $("photoPreview").src = s.photo;
    $("photoPreview").classList.remove("empty");
    $("photoPlaceholder").style.display = "none";
  } else {
    $("photoPreview").src = "";
    $("photoPreview").classList.add("empty");
    $("photoPlaceholder").style.display = "block";
  }
  $("formTitle").textContent = "Hariri Mhitimu";
  $("submitBtn").textContent = "💾 Save Changes";
  $("editingBadge").classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

function deleteStudent(index){
  if(!confirm(`Unataka kufuta ${students[index].name}?`)) return;
  students.splice(index,1);
  saveData();
  renderAll();
  if(Number($("editIndex").value) === index) resetForm();
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function makeCard(s){
  const photo = s.photo
    ? `<img class="student-photo" src="${s.photo}" alt="">`
    : `<div class="student-photo no-photo">NO PHOTO</div>`;
  return `
    <article class="student-card">
      ${photo}
      <div class="student-name">${escapeHtml(s.name)}</div>
      <div class="details">
        <div><b>Jina:</b> ${escapeHtml(s.name)}</div>
        <div><b>Mahali anapotoka:</b> ${escapeHtml(s.place)}</div>
        <div><b>Somo analopenda:</b> ${escapeHtml(s.subject)}</div>
        <div><b>Ndoto yake:</b> ${escapeHtml(s.dream)}</div>
      </div>
    </article>`;
}

function renderPreview(){
  const title = $("pageTitle").value || "FORM IV CLASS";
  const subtitle = $("pageSubtitle").value || "CLASS MEMBERS";
  const pages = [];
  for(let i=0;i<students.length;i+=12){
    const group = students.slice(i,i+12);
    const cards = group.map(makeCard).join("");
    pages.push(`
      <section class="page">
        <div class="page-header">
          <div class="header-box">
            <p class="title">${escapeHtml(title)}</p>
            <p class="subtitle">${escapeHtml(subtitle)}</p>
          </div>
        </div>
        <div class="grid">${cards}</div>
        <div class="page-number">${Math.floor(i/12)+1}</div>
      </section>`);
  }
  $("bookletPreview").innerHTML = pages.length ? pages.join("") :
    `<div style="padding:50px;text-align:center;color:#777">Ongeza wahitimu ili preview ionekane.</div>`;
}

function renderList(){
  $("studentCount").textContent = students.length;
  $("studentList").innerHTML = students.length ? students.map((s,i)=>`
    <div class="student-row">
      ${s.photo ? `<img class="list-photo" src="${s.photo}" alt="">` : `<div class="list-photo"></div>`}
      <div class="row-info">
        <strong>${escapeHtml(s.name)}</strong>
        <small>${escapeHtml(s.place)} • ${escapeHtml(s.subject)} • ${escapeHtml(s.dream)}</small>
      </div>
      <div class="row-actions">
        <button class="small-btn edit" onclick="editStudent(${i})">Edit</button>
        <button class="small-btn delete" onclick="deleteStudent(${i})">Delete</button>
      </div>
    </div>`).join("") :
    `<p class="muted">Bado hakuna mwanafunzi aliyeongezwa.</p>`;
}

function renderAll(){
  renderPreview();
  renderList();
}

$("studentForm").addEventListener("submit", e=>{
  e.preventDefault();
  const index = Number($("editIndex").value);
  const student = {
    name: $("name").value.trim(),
    place: $("place").value.trim(),
    subject: $("subject").value.trim(),
    dream: $("dream").value.trim(),
    photo: croppedImageData || originalImageData || ""
  };
  if(!student.name) return alert("Weka jina la mhitimu.");
  if(index >= 0){
    students[index] = student;
  }else{
    students.push(student);
  }
  saveData();
  renderAll();
  resetForm();
});

$("cancelEditBtn").addEventListener("click", resetForm);
$("saveBtn").addEventListener("click", saveData);
$("pageTitle").addEventListener("input", renderPreview);
$("pageSubtitle").addEventListener("input", renderPreview);

$("photoInput").addEventListener("change", e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    originalImageData = reader.result;
    $("cropImage").src = reader.result;
    $("cropModal").classList.remove("hidden");
    if(cropper) cropper.destroy();
    cropper = new Cropper($("cropImage"), {
      aspectRatio:1,
      viewMode:1,
      dragMode:"move",
      autoCropArea:.9,
      responsive:true
    });
  };
  reader.readAsDataURL(file);
});

$("cropBtn").addEventListener("click", ()=>{
  if(!originalImageData) return;
  $("cropImage").src = originalImageData;
  $("cropModal").classList.remove("hidden");
  if(cropper) cropper.destroy();
  cropper = new Cropper($("cropImage"), {aspectRatio:1, viewMode:1, dragMode:"move", autoCropArea:.9});
});

$("applyCrop").addEventListener("click", ()=>{
  if(!cropper) return;
  const canvas = cropper.getCroppedCanvas({width:700,height:700,imageSmoothingQuality:"high"});
  croppedImageData = canvas.toDataURL("image/jpeg", .9);
  $("photoPreview").src = croppedImageData;
  $("photoPreview").classList.remove("empty");
  $("photoPlaceholder").style.display = "none";
  $("cropModal").classList.add("hidden");
  cropper.destroy(); cropper=null;
});

$("closeCrop").addEventListener("click", ()=>{
  $("cropModal").classList.add("hidden");
  if(cropper){cropper.destroy();cropper=null;}
});
$("rotateLeft").addEventListener("click", ()=>cropper && cropper.rotate(-90));
$("rotateRight").addEventListener("click", ()=>cropper && cropper.rotate(90));

async function downloadPDF(){
  if(!students.length) return alert("Ongeza angalau mhitimu mmoja.");
  const pages = [...document.querySelectorAll(".page")];
  const {jsPDF} = window.jspdf;
  const pdf = new jsPDF({orientation:"portrait", unit:"mm", format:"a4"});
  for(let i=0;i<pages.length;i++){
    const canvas = await html2canvas(pages[i], {
      scale:2.2, useCORS:true, backgroundColor:"#ffffff"
    });
    const img = canvas.toDataURL("image/jpeg", .94);
    if(i>0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, 210, 297);
  }
  pdf.save("graduate-booklet.pdf");
}

$("pdfBtn").addEventListener("click", downloadPDF);

async function downloadWord(){
  if(!students.length) return alert("Ongeza angalau mhitimu mmoja.");
  const {Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, AlignmentType, WidthType} = docx;
  const children = [];
  const title = $("pageTitle").value || "FORM IV CLASS";
  const subtitle = $("pageSubtitle").value || "CLASS MEMBERS";

  for(let p=0;p<students.length;p+=12){
    if(p>0) children.push(new Paragraph({pageBreakBefore:true}));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children:[new TextRun({text:title,bold:true,size:30})]
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children:[new TextRun({text:subtitle,bold:true,size:24})]
    }));

    const rows=[];
    const group=students.slice(p,p+12);
    for(let r=0;r<3;r++){
      const cells=[];
      for(let c=0;c<4;c++){
        const s=group[r*4+c];
        if(!s){
          cells.push(new TableCell({children:[new Paragraph("")]}));
          continue;
        }
        const cellChildren=[];
        if(s.photo){
          try{
            const data = await fetch(s.photo).then(x=>x.arrayBuffer());
            cellChildren.push(new Paragraph({
              alignment:AlignmentType.CENTER,
              children:[new ImageRun({data, transformation:{width:105,height:105}, type:"jpg"})]
            }));
          }catch(err){}
        }
        cellChildren.push(new Paragraph({alignment:AlignmentType.CENTER, children:[
          new TextRun({text:s.name.toUpperCase(),bold:true,size:17})
        ]}));
        cellChildren.push(new Paragraph({children:[new TextRun({text:"Jina: ",bold:true,size:12}),new TextRun({text:s.name,size:12})]}));
        cellChildren.push(new Paragraph({children:[new TextRun({text:"Mahali anapotoka: ",bold:true,size:12}),new TextRun({text:s.place,size:12})]}));
        cellChildren.push(new Paragraph({children:[new TextRun({text:"Somo analopenda: ",bold:true,size:12}),new TextRun({text:s.subject,size:12})]}));
        cellChildren.push(new Paragraph({children:[new TextRun({text:"Ndoto yake: ",bold:true,size:12}),new TextRun({text:s.dream,size:12})]}));
        cells.push(new TableCell({children:cellChildren}));
      }
      rows.push(new TableRow({children:cells}));
    }
    children.push(new Table({
      width:{size:100,type:WidthType.PERCENTAGE},
      rows
    }));
    children.push(new Paragraph({
      alignment:AlignmentType.CENTER,
      children:[new TextRun({text:String(Math.floor(p/12)+1),size:14})]
    }));
  }

  const doc = new Document({sections:[{properties:{page:{size:{width:11906,height:16838}}},children}]});
  const blob = await Packer.toBlob(doc);
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="graduate-booklet.docx";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
$("wordBtn").addEventListener("click", downloadWord);

$("printBtn").addEventListener("click", ()=>window.print());

renderAll();
