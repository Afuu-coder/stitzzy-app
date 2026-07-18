import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BLAZER_MEN = [
  { size: "XS",  chest: "36", length: "27",   sleeve: "23.5" },
  { size: "S",   chest: "38", length: "28",   sleeve: "24" },
  { size: "M",   chest: "40", length: "29",   sleeve: "24.5" },
  { size: "L",   chest: "42", length: "30",   sleeve: "25" },
  { size: "XL",  chest: "44", length: "31",   sleeve: "25.5" },
  { size: "2XL", chest: "46", length: "32",   sleeve: "26" },
  { size: "3XL", chest: "48", length: "33",   sleeve: "26.5" },
  { size: "4XL", chest: "50", length: "34",   sleeve: "27" },
  { size: "5XL", chest: "52", length: "35",   sleeve: "27.5" },
];

const BLAZER_WOMEN = [
  { size: "XS",  chest: "32", length: "24.5", sleeve: "22.5" },
  { size: "S",   chest: "34", length: "25.5", sleeve: "23" },
  { size: "M",   chest: "36", length: "26.5", sleeve: "23.5" },
  { size: "L",   chest: "38", length: "27.5", sleeve: "24" },
  { size: "XL",  chest: "40", length: "28.5", sleeve: "24.5" },
  { size: "2XL", chest: "42", length: "29.5", sleeve: "25" },
  { size: "3XL", chest: "44", length: "30.5", sleeve: "25.5" },
  { size: "4XL", chest: "46", length: "31.5", sleeve: "26" },
  { size: "5XL", chest: "48", length: "32.5", sleeve: "26.5" },
];

const PANT_MEN = [
  { size: "28", waist: "28", hip: "36", length: "40" },
  { size: "30", waist: "30", hip: "38", length: "40.5" },
  { size: "32", waist: "32", hip: "40", length: "41" },
  { size: "34", waist: "34", hip: "42", length: "41.5" },
  { size: "36", waist: "36", hip: "44", length: "42" },
  { size: "38", waist: "38", hip: "46", length: "42.5" },
  { size: "40", waist: "40", hip: "48", length: "43" },
  { size: "42", waist: "42", hip: "50", length: "43.5" },
  { size: "44", waist: "44", hip: "52", length: "44" },
];

const PANT_WOMEN = [
  { size: "26", waist: "26", hip: "36", length: "38" },
  { size: "28", waist: "28", hip: "38", length: "38.5" },
  { size: "30", waist: "30", hip: "40", length: "39" },
  { size: "32", waist: "32", hip: "42", length: "39.5" },
  { size: "34", waist: "34", hip: "44", length: "40" },
  { size: "36", waist: "36", hip: "46", length: "40.5" },
  { size: "38", waist: "38", hip: "48", length: "41" },
  { size: "40", waist: "40", hip: "50", length: "41.5" },
  { size: "42", waist: "42", hip: "52", length: "42" },
];

const TSHIRT_CHART = [
  { size: "XS",  chest: "36", length: "25", sleeve: "7" },
  { size: "S",   chest: "38", length: "26", sleeve: "7" },
  { size: "M",   chest: "40", length: "27", sleeve: "7.5" },
  { size: "L",   chest: "42", length: "28", sleeve: "8" },
  { size: "XL",  chest: "44", length: "29", sleeve: "8.5" },
  { size: "2XL", chest: "46", length: "30", sleeve: "9" },
  { size: "3XL", chest: "48", length: "31", sleeve: "9.5" },
  { size: "4XL", chest: "50", length: "32", sleeve: "10" },
  { size: "5XL", chest: "52", length: "33", sleeve: "10" },
];

export function SizeChartModal({ 
  isOpen, 
  onClose, 
  category = "Shirt", 
  gender = "Unisex" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  category?: string; 
  gender?: string;
}) {
  if (!isOpen) return null;

  let headers = ["SIZE", "CHEST (in)", "LENGTH (in)", "SLEEVE (in)"];
  let rows: any[] = TSHIRT_CHART;
  let title = "Size Chart";
  let note = "All measurements are in inches. Regular fit.";

  const isBlazer = category.toLowerCase().includes("blazer");
  const isPant = category.toLowerCase().includes("pant");
  const isWomen = gender.toLowerCase() === "women";

  if (isBlazer) {
    title = isWomen ? "Women's Blazer Size Chart" : "Men's Blazer Size Chart";
    rows = isWomen ? BLAZER_WOMEN : BLAZER_MEN;
    if (isWomen) headers = ["SIZE", "BUST (in)", "LENGTH (in)", "SLEEVE (in)"];
    note = "Our blazers are tailored in a regular fit for a smart, professional appearance. All sizes are in inches.";
  } else if (isPant) {
    title = isWomen ? "Women's Pant Size Chart" : "Men's Pant Size Chart";
    headers = ["SIZE", "WAIST (in)", "HIP (in)", "LENGTH (in)"];
    rows = isWomen ? PANT_WOMEN : PANT_MEN;
    note = "Our trousers are tailored in a regular fit for maximum comfort and a professional appearance. All sizes are in inches. Pant length will be provided with standard extra length and can be altered if required.";
  } else {
    // Default to T-Shirt / Shirt
    title = "Shirt / T-Shirt Size Chart";
    note = "Our shirts are tailored to a regular fit; not too tight, not too loose. All sizes are in inches.";
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-ink/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-semibold tracking-wide uppercase text-sm">{title}</h3>
              <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <X size={18} />
              </button>
            </div>
            
            {/* Table */}
            <div className="overflow-y-auto overflow-x-auto p-6 flex-1">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="font-display font-bold text-xs uppercase tracking-wider py-3 border border-ink text-ink bg-canvas-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-canvas transition-colors">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className={`py-2.5 border border-ink text-ink ${i === 0 ? 'font-bold font-display text-sm' : 'font-mono text-xs'}`}>
                          {String(val)}{i > 0 && '"'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 bg-canvas p-4 rounded-lg flex gap-4 items-start border border-ink/10">
                <div className="w-8 h-8 rounded bg-ink flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <p className="font-mono text-[10px] text-ink-muted leading-relaxed">
                  {note}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
