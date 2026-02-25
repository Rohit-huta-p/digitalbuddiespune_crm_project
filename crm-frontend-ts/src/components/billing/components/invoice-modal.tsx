import React, { useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DownloadIcon, CameraIcon } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InvoiceModal = ({ isOpen, onClose, bill }: any) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    if (!bill) return null;

    const handleDownloadPDF = async () => {
        const element = invoiceRef.current;
        if (!element) return;

        try {
            // Temporarily scale up for better resolution
            const originalTransform = element.style.transform;
            element.style.transform = "scale(2)";
            element.style.transformOrigin = "top left";

            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            // Restore original style
            element.style.transform = originalTransform;

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${bill.invoiceNumber || bill["Bill Id"]}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        }
    };

    const formatCurrency = (amount: any) => {
        return amount
            ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
            : "₹0.00";
    };

    const calculatedSubtotal = bill.amount || 0;
    const calculatedTax = bill.taxAmount || 0;
    const calculatedDiscount = bill.discountAmount || 0;
    const calculatedTotal = calculatedSubtotal + calculatedTax - calculatedDiscount;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* Ensure width fits a nice A4-like aspect ratio visually on screen */}
            <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] p-0 overflow-y-auto bg-neutral-200 flex flex-col items-center">
                {/* Hidden titles for accessibility compliance without breaking layout */}
                <VisuallyHidden>
                    <DialogTitle>Invoice Options</DialogTitle>
                    <DialogDescription>Invoice Preview and Download</DialogDescription>
                </VisuallyHidden>

                {/* Floating Download Button */}
                <div className="sticky top-0 z-50 w-full bg-white/50 backdrop-blur-md p-4 flex justify-end shadow-sm">
                    <Button onClick={handleDownloadPDF} className="flex gap-2">
                        <DownloadIcon size={16} /> Download PDF
                    </Button>
                </div>

                {/* --- ACTUAL INVOICE A4 CANVAS --- */}
                <div
                    ref={invoiceRef}
                    className="bg-white text-black font-sans shadow-2xl relative"
                    style={{
                        width: "210mm",
                        minHeight: "297mm", // A4 Aspect ratio dimensions
                        margin: "20px auto",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    {/* Header Black Bar */}
                    <div className="bg-black text-white px-10 py-10 flex justify-between items-center">
                        <h1 className="text-5xl font-bold tracking-widest">INVOICE</h1>
                        <div className="flex items-center gap-4 border-l border-white/50 pl-6">
                            <CameraIcon size={40} />
                            <div className="leading-tight">
                                <div className="text-xl font-bold tracking-widest">DIGITAL</div>
                                <div className="text-lg tracking-widest">BUDDIES</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-12 flex-grow flex flex-col text-sm">
                        {/* Bill To & From */}
                        <div className="flex justify-between items-start pt-4 mb-10">
                            {/* Bill To */}
                            <div className="w-[45%]">
                                <div className="flex items-center mb-4">
                                    <h2 className="text-xl font-bold mr-4">Bill to</h2>
                                    <div className="h-[1px] bg-black flex-grow"></div>
                                </div>
                                <p className="font-semibold text-base">{bill.customerName}</p>
                                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{bill.billingAddress || "No address provided"}</p>
                                <p className="text-gray-600">{bill.phno}</p>
                                <p className="text-gray-600">{bill.email}</p>
                            </div>

                            {/* From */}
                            <div className="w-[45%] text-right text-gray-600">
                                <div className="flex items-center mb-4 justify-end">
                                    <div className="h-[1px] bg-black flex-grow"></div>
                                    <h2 className="text-xl font-bold text-black ml-4">From</h2>
                                </div>
                                <p className="font-semibold text-black text-base">Digital Buddies</p>
                                <p className="mt-1">Generated By: {bill.generatedBy}</p>
                                <p>System Company Id: {bill.companyId}</p>
                                <p>Pune, Maharashtra, India</p>
                            </div>
                        </div>

                        {/* Date & Invoice No */}
                        <div className="flex justify-between items-end mb-12">
                            <div className="w-[60%] flex items-end">
                                <div className="mr-8">
                                    <h3 className="text-lg font-bold mb-1">Date</h3>
                                    <p className="text-gray-600">{bill.billingDate ? format(new Date(bill.billingDate), "dd/MM/yy") : "00/00/00"}</p>
                                </div>
                                <div className="mr-4 mb-1">
                                    <h3 className="text-lg font-bold mb-1">Due</h3>
                                    <p className="text-gray-600">{bill.billDueDate ? format(new Date(bill.billDueDate), "dd/MM/yy") : "00/00/00"}</p>
                                </div>
                                <div className="h-[1px] bg-black flex-grow mb-1 ml-4"></div>
                            </div>

                            <div className="text-right">
                                <h3 className="text-lg font-bold mb-1">Invoice</h3>
                                <p className="text-gray-600">{bill.invoiceNumber || `#${bill["Bill Id"]}`}</p>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 pb-2 border-b border-black mb-4 font-bold text-base">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {/* Table Rows (Assuming 1 primary service item for now as per data structure) */}
                        <div className="grid grid-cols-12 gap-4 py-2">
                            <div className="col-span-6 text-gray-700 font-semibold">{bill.serviceTitle || "Miscellaneous Service"}</div>
                            <div className="col-span-2 text-center text-gray-600">{formatCurrency(calculatedSubtotal)}</div>
                            <div className="col-span-2 text-center text-gray-600">1</div>
                            <div className="col-span-2 text-right text-gray-800">{formatCurrency(calculatedSubtotal)}</div>
                        </div>
                        {bill.serviceDesc && (
                            <div className="grid grid-cols-12 gap-4 py-1 mb-6">
                                <div className="col-span-12 text-gray-500 italic text-sm">{bill.serviceDesc}</div>
                            </div>
                        )}


                        {/* Spacer to push totals and footer to bottom half */}
                        <div className="flex-grow"></div>

                        {/* Footer Calculation Section */}
                        <div className="flex justify-between items-start mt-20 pb-12">
                            {/* Payment & Terms (Left) */}
                            <div className="w-[55%] pr-8 border-r border-black relative">
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold mb-2">Payment method</h3>
                                    <p className="text-gray-600">{bill.paymentMethod || "As agreed"}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Terms & conditions</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
                                        {bill.notes || "Payment is due according to the date and conditions agreed upon in the primary service contract. Please direct all billing inquiries to our support team."}
                                    </p>
                                </div>
                            </div>

                            {/* Totals (Right) */}
                            <div className="w-[45%] pl-8 flex flex-col gap-4 text-base">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Subtotal</span>
                                    <div className="h-[1px] bg-black/20 flex-grow mx-4"></div>
                                    <span className="text-gray-600">{formatCurrency(calculatedSubtotal)}</span>
                                </div>
                                {(calculatedTax > 0 || calculatedDiscount > 0) && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Tax</span>
                                            <div className="h-[1px] bg-black/20 flex-grow mx-4"></div>
                                            <span className="text-gray-600">{formatCurrency(calculatedTax)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Discount</span>
                                            <div className="h-[1px] bg-black/20 flex-grow mx-4"></div>
                                            <span className="text-red-500">-{formatCurrency(calculatedDiscount)}</span>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xl font-bold">Total</span>
                                    <div className="border border-black rounded-full px-4 py-1 font-bold text-lg min-w-[120px] text-right">
                                        {formatCurrency(calculatedTotal)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Black Footer */}
                    <div className="bg-black text-white px-10 py-6 flex justify-between items-center text-sm font-light mt-auto">
                        <a href="mailto:info@digitalbuddies.in" className="hover:underline">info@digitalbuddies.in</a>
                        <a href="https://digitalbuddies.in" target="_blank" rel="noreferrer" className="hover:underline">www.digitalbuddies.in</a>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};
