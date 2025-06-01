import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CouponStore {
    couponCode: string;
    discount: number;
    setCoupon: (code: string, discountAmount: number) => void;
    clearCoupon: () => void;
}

export const useCouponStore = create<CouponStore>()(
    persist(
        (set) => ({
            couponCode: "",
            discount: 0,
            setCoupon: (code, discountAmount) => 
                set({ couponCode: code, discount: discountAmount }),
            clearCoupon: () => set({ couponCode: "", discount: 0 }),
        }),
        {
            name: "coupon-storage",
        }
    )
); 