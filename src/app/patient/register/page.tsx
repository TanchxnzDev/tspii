"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/utils/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import {
  CheckCircle2, Loader2, ChevronRight, ChevronLeft, ShieldCheck, User, Activity, Camera, X
} from "lucide-react";
import NextLink from "next/link";

export default function UltimateWizardRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newHN, setNewHN] = useState("");

  const [formData, setFormData] = useState({
    IDcard: "", branchID: "B0000", password: "", conf_pass: "",
    prefix: "", fname: "", lname: "", sex: "", bd_date: "",
    nationality: "ไทย", ethnicity: "ไทย", marry_status: "",
    email: "", phone: "", phone2: "", fb_name: "",
    address: "", district: "", amphur: "", province: "", zipcode: "", country: "TH",
    education: "", career: "", salary: 0,
    weight: "", height: "", smoking: "no", drink: "ไม่ดื่ม",
    time_sleep: "22:00", time_wakeup: "06:00", sleep_score: "10",
    vaccinated: "", symptoms: "",
    disease: [] as string[], disease_other: "",
    cure_disease: [] as string[], cure_other: "",
    score_disease: "ไม่แสดงอาการ", score_pain: "1",
    drug_current: "", drug_allergy: "", detail_disease: "",
    where_cure: "", long_cure: "", long_cure_type: "เดือน",
    his_medicine: "", his_antibiotic: "",
    quantity_medicine: "", purpose_medicine: "",
    reason: [] as string[], reason_other: "",
    accept: "yes", who_regis: "ผู้ป่วยกรอกเอง", who_regis2: "",
  });

  const [today] = useState(() => new Date());

  const ageCalc = useMemo(() => {
    if (!formData.bd_date) return "";
    const selectedDate = new Date(formData.bd_date);
    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) age--;
    return age.toString();
  }, [formData.bd_date, today]);

  const bmiCalc = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100;
    if (w && h) return (w / (h * h)).toFixed(1);
    return "";
  }, [formData.weight, formData.height]);

  const bmiLabel = useMemo(() => {
    const b = parseFloat(bmiCalc);
    if (!b) return "";
    if (b < 18.5) return "น้ำหนักน้อยเกินไป";
    if (b < 23) return "ปกติ (สุขภาพดี)";
    if (b < 25) return "น้ำหนักเกิน";
    if (b < 30) return "อ้วนระดับ 1";
    return "อ้วนระดับ 2";
  }, [bmiCalc]);

  const sleepTotal = useMemo(() => {
    if (!formData.time_sleep || !formData.time_wakeup) return "";
    const [sh, sm] = formData.time_sleep.split(":").map(Number);
    const [wh, wm] = formData.time_wakeup.split(":").map(Number);
    let mins = (wh * 60 + wm) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return `${Math.floor(mins / 60)} ชม. ${mins % 60} นาที`;
  }, [formData.time_sleep, formData.time_wakeup]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && formData.password !== formData.conf_pass) return setError("รหัสผ่านไม่ตรงกัน");
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleCheckboxChange = (field: 'disease' | 'cure_disease' | 'reason', value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนลงทะเบียน");

      const hn = user.uid.slice(0, 8).toUpperCase();
      const patientData = {
        hn,
        uid: user.uid,
        lineUid: user.uid,
        ...formData,
        email: formData.email || `${formData.IDcard}@tspi-patient.com`,
        age: ageCalc,
        bmi_val: bmiCalc,
        bmi: bmiLabel,
        time_total: sleepTotal,
        role: "patient",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // บันทึกลง Firestore collection patients/{uid}
      await setDoc(doc(db, "patients", user.uid), patientData);

      setNewHN(hn);
      setStep(4);
    } catch (err: any) { setError(err.message || "เกิดข้อผิดพลาด"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-vh-100 bg-light py-5 px-3 font-kanit">
      <div className="mx-auto" style={{ maxWidth: '1000px' }}>

        <div className="text-center mb-5">
          <NextLink href="/" className="text-decoration-none">
            <h2 className="fw-bold text-dark m-0">TSPI <span className="text-primary-custom">CLINIC</span></h2>
          </NextLink>
        </div>

        <div className="bg-white shadow-lg rounded-4 overflow-hidden border-top border-primary-custom border-5">
          {step < 4 && (
            <div className="bg-gray-50 px-4 py-4 border-bottom">
              <div className="row text-center">
                <div className={`col-4 fw-bold ${step === 1 ? 'text-primary-custom' : 'text-muted'}`}>1. บัญชีผู้ใช้งาน</div>
                <div className={`col-4 fw-bold ${step === 2 ? 'text-primary-custom' : 'text-muted'}`}>2. ข้อมูลส่วนตัว</div>
                <div className={`col-4 fw-bold ${step === 3 ? 'text-primary-custom' : 'text-muted'}`}>3. ประวัติสุขภาพเชิงลึก</div>
              </div>
              <div className="progress mt-3" style={{ height: '5px' }}><div className="progress-bar bg-primary-custom" style={{ width: `${(step / 3) * 100}%` }}></div></div>
            </div>
          )}

          <div className="p-4 p-md-5">
            {step < 4 ? (
              <form onSubmit={step === 3 ? handleSubmit : handleNext} className="row g-3">

                {/* STEP 1: ACCOUNT */}
                {step === 1 && (
                  <>
                    <div className="col-12"><h6 className="fw-bold border-bottom pb-2">ขั้นตอนที่ 1: ข้อมูลการเข้าสู่ระบบ</h6></div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">เลขบัตรประชาชน / Passport ID *</label>
                      <input type="text" className="form-control" required value={formData.IDcard} onChange={e => setFormData({ ...formData, IDcard: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">สาขาที่เข้ารับบริการ *</label>
                      <select className="form-select" required value={formData.branchID} onChange={e => setFormData({ ...formData, branchID: e.target.value })}>
                        <option value="B0000">สำนักงานใหญ่</option><option value="B0001">สาขาเชียงใหม่</option><option value="B0002">สาขาภูเก็ต</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">รหัสผ่าน *</label>
                      <input type="password" className="form-control" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ยืนยันรหัสผ่าน *</label>
                      <input type="password" className="form-control" required value={formData.conf_pass} onChange={e => setFormData({ ...formData, conf_pass: e.target.value })} />
                    </div>
                  </>
                )}

                {/* STEP 2: PERSONAL */}
                {step === 2 && (
                  <>
                    <div className="col-12"><h6 className="fw-bold border-bottom pb-2">ขั้นตอนที่ 2: ข้อมูลส่วนบุคคลและที่อยู่</h6></div>
                    <div className="col-md-2">
                      <label className="form-label small fw-bold">คำนำหน้า</label>
                      <select className="form-select" value={formData.prefix} onChange={e => setFormData({ ...formData, prefix: e.target.value })}>
                        <option value="">เลือก</option><option value="นาย">นาย</option><option value="นาง">นาง</option><option value="นางสาว">นางสาว</option>
                      </select>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold">ชื่อ *</label>
                      <input type="text" className="form-control" required value={formData.fname} onChange={e => setFormData({ ...formData, fname: e.target.value })} />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold">นามสกุล *</label>
                      <input type="text" className="form-control" required value={formData.lname} onChange={e => setFormData({ ...formData, lname: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">วันเกิด *</label>
                      <input type="date" className="form-control" required value={formData.bd_date} onChange={e => setFormData({ ...formData, bd_date: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">อายุ (คำนวณ)</label>
                      <input type="text" className="form-control bg-light" readOnly value={ageCalc} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">เพศ *</label>
                      <select className="form-select" required value={formData.sex} onChange={e => setFormData({ ...formData, sex: e.target.value })}>
                        <option value="">เลือก</option><option value="ชาย">ชาย</option><option value="หญิง">หญิง</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">สัญชาติ *</label>
                      <input type="text" className="form-control" required value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">เชื้อชาติ *</label>
                      <input type="text" className="form-control" required value={formData.ethnicity} onChange={e => setFormData({ ...formData, ethnicity: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">สถานภาพ *</label>
                      <select className="form-select" value={formData.marry_status} onChange={e => setFormData({ ...formData, marry_status: e.target.value })}>
                        <option value="">เลือก</option><option value="โสด">โสด</option><option value="สมรส">สมรส</option><option value="หย่าร้าง">หย่าร้าง</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">เบอร์โทรศัพท์ *</label>
                      <input type="tel" className="form-control" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">อีเมล *</label>
                      <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">ที่อยู่ปัจจุบัน *</label>
                      <textarea className="form-control" rows={2} required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">แขวง/ตำบล</label>
                      <input type="text" className="form-control" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">เขต/อำเภอ</label>
                      <input type="text" className="form-control" value={formData.amphur} onChange={e => setFormData({ ...formData, amphur: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">จังหวัด</label>
                      <input type="text" className="form-control" value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">รหัสไปรษณีย์</label>
                      <input type="text" className="form-control" value={formData.zipcode} onChange={e => setFormData({ ...formData, zipcode: e.target.value })} />
                    </div>
                  </>
                )}

                {/* STEP 3: FULL MEDICAL (EXTENDED) */}
                {step === 3 && (
                  <>
                    <div className="col-12"><h6 className="fw-bold border-bottom pb-2">ขั้นตอนที่ 3: ประวัติสุขภาพเชิงลึก (Clinical Profile)</h6></div>

                    {/* Metrics */}
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">น้ำหนัก (kg) *</label>
                      <input type="number" step="0.1" className="form-control" required value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">ส่วนสูง (cm) *</label>
                      <input type="number" step="0.1" className="form-control" required value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                    </div>
                    <div className="col-md-6 text-center bg-light rounded py-2">
                      <label className="form-label small fw-bold d-block">BMI Status</label>
                      <span className="fw-bold text-primary-custom fs-5">{bmiCalc} - {bmiLabel}</span>
                    </div>

                    {/* Vaccine */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">การฉีดวัคซีน COVID-19 *</label>
                      <select className="form-select" required value={formData.vaccinated} onChange={e => setFormData({ ...formData, vaccinated: e.target.value })}>
                        <option value="">เลือก</option><option value="ไม่ได้ฉีด">ไม่ได้ฉีด</option><option value="ฉีดครบ 2 เข็ม">ฉีดครบ 2 เข็ม</option><option value="เข็มกระตุ้น 3+">เข็มกระตุ้น 3+</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">อาการผิดปกติหลังฉีด</label>
                      <input type="text" className="form-control" value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })} />
                    </div>

                    {/* Diseases Checklist */}
                    <div className="col-12 mt-4">
                      <label className="form-label small fw-bold">โรคประจำตัว (เลือกได้หลายข้อ)</label>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {["เบาหวาน", "ความดันสูง", "ไขมันสูง", "โรคหัวใจ", "ภูมิแพ้", "ไมเกรน", "ริดสีดวง"].map(d => (
                          <button key={d} type="button" onClick={() => handleCheckboxChange('disease', d)}
                            className={`btn btn-sm rounded-pill border ${formData.disease.includes(d) ? 'bg-primary-custom text-white border-primary-custom' : 'bg-white'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      <input type="text" className="form-control mt-2" placeholder="โรคอื่นๆ (ระบุ)" value={formData.disease_other} onChange={e => setFormData({ ...formData, disease_other: e.target.value })} />
                    </div>

                    {/* Scores */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ระดับอาการปัจจุบัน *</label>
                      <select className="form-select" value={formData.score_disease} onChange={e => setFormData({ ...formData, score_disease: e.target.value })}>
                        {["ไม่แสดงอาการ", "น้อย", "ปานกลาง", "หนัก", "หนักมาก"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ระดับความเจ็บปวด (Pain Score 1-10) *</label>
                      <input type="range" className="form-range" min="1" max="10" value={formData.score_pain} onChange={e => setFormData({ ...formData, score_pain: e.target.value })} />
                      <div className="text-center fw-bold text-primary-custom">{formData.score_pain}</div>
                    </div>

                    {/* Detail & Medications */}
                    <div className="col-12">
                      <label className="form-label small fw-bold">อธิบายอาการป่วยโดยละเอียด *</label>
                      <textarea className="form-control" rows={3} required value={formData.detail_disease} onChange={e => setFormData({ ...formData, detail_disease: e.target.value })} placeholder="เริ่มเป็นเมื่อไหร่ อาการเป็นอย่างไร..."></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ยาที่ทานอยู่ปัจจุบัน *</label>
                      <input type="text" className="form-control" required value={formData.drug_current} onChange={e => setFormData({ ...formData, drug_current: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ประวัติการแพ้ยา</label>
                      <input type="text" className="form-control border-danger" value={formData.drug_allergy} onChange={e => setFormData({ ...formData, drug_allergy: e.target.value })} />
                    </div>

                    {/* History */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">รักษาก่อนหน้าที่ไหน? *</label>
                      <select className="form-select" required value={formData.where_cure} onChange={e => setFormData({ ...formData, where_cure: e.target.value })}>
                        <option value="">เลือก</option><option value="ยังไม่เคยรักษา">ยังไม่เคยรักษา</option><option value="ซื้อยาทานเอง">ซื้อยาทานเอง</option><option value="คลินิก">คลินิก</option><option value="โรงพยาบาล">โรงพยาบาล</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">มีอาการมานานเท่าไหร่? *</label>
                      <div className="input-group">
                        <input type="number" className="form-control" required value={formData.long_cure} onChange={e => setFormData({ ...formData, long_cure: e.target.value })} />
                        <select className="form-select" style={{ maxWidth: '100px' }} value={formData.long_cure_type} onChange={e => setFormData({ ...formData, long_cure_type: e.target.value })}>
                          <option value="เดือน">เดือน</option><option value="ปี">ปี</option>
                        </select>
                      </div>
                    </div>

                    {/* Antibiotics & Usage */}
                    <div className="col-12">
                      <label className="form-label small fw-bold">ประวัติการใช้ยาปฏิชีวนะ (Antibiotics)</label>
                      <textarea className="form-control" rows={2} value={formData.his_antibiotic} onChange={e => setFormData({ ...formData, his_antibiotic: e.target.value })}></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ปริมาณยาที่ใช้ต่อครั้ง</label>
                      <input type="text" className="form-control" value={formData.quantity_medicine} onChange={e => setFormData({ ...formData, quantity_medicine: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">วัตถุประสงค์ของการใช้ยา</label>
                      <input type="text" className="form-control" value={formData.purpose_medicine} onChange={e => setFormData({ ...formData, purpose_medicine: e.target.value })} />
                    </div>

                    {/* Marketing & Who */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ใครเป็นคนกรอกข้อมูลนี้? *</label>
                      <select className="form-select" required value={formData.who_regis} onChange={e => setFormData({ ...formData, who_regis: e.target.value })}>
                        <option value="ผู้ป่วยกรอกเอง">ผู้ป่วยกรอกเอง</option><option value="ญาติ/คนรู้จัก">ญาติ/คนรู้จัก</option><option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">สาเหตุที่เลือกรับบริการ</label>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {["มีผู้แนะนำ", "อินเตอร์เน็ต", "รักษาที่อื่นไม่หาย"].map(r => (
                          <button key={r} type="button" onClick={() => handleCheckboxChange('reason', r)}
                            className={`btn btn-sm border ${formData.reason.includes(r) ? 'bg-primary-custom text-white' : 'bg-white'}`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accept */}
                    <div className="col-12 mt-4 p-3 bg-light rounded border">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="accept" required />
                        <label className="form-check-label small text-muted" htmlFor="accept">
                          ข้าพเจ้ายินยอมให้ใช้ข้อมูลเพื่อการวิจัยทางการแพทย์และรักษาพยาบาลของ TSPI Clinic
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {error && <div className="col-12"><div className="alert alert-danger py-2 small fw-bold">{error}</div></div>}

                <div className="col-12 d-flex gap-2 mt-4 pt-4 border-top">
                  {step > 1 && <button type="button" className="btn btn-light px-4 border" onClick={() => setStep(step - 1)}>ย้อนกลับ</button>}
                  <button type="submit" className="btn btn-drpat-primary flex-grow-1 py-3 fw-bold shadow" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin d-inline me-2" size={18} /> : null}
                    {step === 3 ? "ยืนยันและส่งข้อมูลทั้งหมด" : "ถัดไป →"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-5">
                <CheckCircle2 size={90} className="text-success mb-4 animate-bounce" />
                <h2 className="fw-bold">ลงทะเบียนสมบูรณ์!</h2>
                <p className="text-muted">HN ของคุณคือ: <span className="text-dark fw-bold">{newHN}</span></p>
                <button onClick={() => router.push('/patient/dashboard')} className="btn btn-drpat-primary px-5 py-2 mt-4 fw-bold">ไปหน้า Dashboard</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .form-control:focus, .form-select:focus { border-color: #D4AF37; box-shadow: 0 0 0 0.25rem rgba(212, 175, 55, 0.1); }
        .btn-drpat-primary { background-color: #D4AF37; color: white; border: none; }
        .btn-drpat-primary:hover { background-color: #B8962E; color: white; }
        .text-primary-custom { color: #D4AF37 !important; }
      `}</style>
    </div>
  );
}
