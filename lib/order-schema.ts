import { z } from "zod";

export const orderSchema = z
  .object({
    customerName: z.string().trim().min(1, "이름을 입력해 주세요").max(40),
    customerPhone: z
      .string()
      .trim()
      .regex(/^0\d{1,2}-?\d{3,4}-?\d{4}$/, "연락처 형식을 확인해 주세요"),
    fulfillmentType: z.enum(["pickup", "delivery"]),
    preferredAt: z.string().min(1, "희망 시간을 선택해 주세요"),
    deliveryAddress: z.string().trim().optional().default(""),
    wantPointEarn: z.boolean(),
    wantCashReceipt: z.boolean(),
    cashReceiptPhone: z.string().trim().optional().default(""),
    items: z
      .array(
        z.object({
          menuId: z.string().uuid(),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1, "장바구니가 비어 있습니다"),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillmentType === "delivery" && !data.deliveryAddress?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "배달 주소를 입력해 주세요",
      });
    }
    if (data.wantCashReceipt && !data.cashReceiptPhone?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["cashReceiptPhone"],
        message: "현금영수증 번호를 입력해 주세요",
      });
    }
  });

export type OrderInput = z.infer<typeof orderSchema>;
