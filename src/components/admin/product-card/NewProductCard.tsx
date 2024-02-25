"use client";

import { z } from "zod";
import { useCallback } from "react";
import useAdmin from "@/hooks/useAdmin";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { RHFUpload } from "@/components/hook-form/rhf-upload";
import FormProvider from "@/components/hook-form/form-provider";
import { refreshmentValidationSchema } from "@/lib/validationSchema";
import { RHFSelect, RHFSwitch, RHFTextField } from "@/components/hook-form";
import { Paper, Stack, MenuItem, IconButton, Typography } from "@mui/material";

// ----------------------------------------------------------------------

export const TYPE_OPTIONS = [
  { value: "BAKERY", label: "เบเกอรี่" },
  { value: "BEVERAGE", label: "เครื่องดื่ม" },
];

export const CATEGORY_OPTIONS = [
  { value: "BREAD", label: "ขนมปัง" },
  { value: "PIE", label: "พาย" },
  { value: "COOKIE", label: "คุกกี้" },
  { value: "SNACK", label: "ขนม" },
  { value: "CAKE", label: "เค้ก" },
];

// ----------------------------------------------------------------------

type Props = {
  onClose: () => void;
};

type RefreshmentProps = z.infer<typeof refreshmentValidationSchema>;

// ----------------------------------------------------------------------

export default function NewProductCard({ onClose }: Props) {
  const methods = useForm<RefreshmentProps>({
    defaultValues: {
      image: "",
      name: "",
      description: "",
      type: undefined,
      category: undefined,
      unitType: undefined,
      minQty: undefined,
      price: undefined,
      currQty: undefined,
      width: undefined,
      length: undefined,
      height: undefined,
      weight: undefined,
      quantity: undefined,
      isActive: true,
      maxQty: undefined,
    },
  });

  const { createProductTrigger, createProductIsLoading } = useAdmin();

  const { enqueueSnackbar } = useSnackbar();

  const { watch, setValue, handleSubmit, reset } = methods;
  const values = watch();

  const { type, isActive } = values;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const {
        name,
        image,
        price,
        type,
        category,
        description,
        quantity,
        minQty,
        currQty,
        weight,
        height,
        length,
        width,
        isActive,
        maxQty,
      } = data;
      const bodyFormData = new FormData();
      bodyFormData.append("name", name);
      bodyFormData.append("image", image);
      bodyFormData.append("price", price ? Number(price).toString() : "0");
      bodyFormData.append("type", type);
      if (description) {
        bodyFormData.append("description", description);
      }
      if (type === "BAKERY") {
        bodyFormData.append("category", category);
      }
      bodyFormData.append(
        "quantity",
        quantity ? Number(quantity).toString() : "0",
      );
      bodyFormData.append("minQty", minQty ? Number(minQty).toString() : "0");
      bodyFormData.append(
        "currQty",
        currQty ? Number(currQty).toString() : "0",
      );
      bodyFormData.append("maxQty", maxQty ? Number(maxQty).toString() : "0");
      bodyFormData.append("weight", weight ? Number(weight).toString() : "0");
      bodyFormData.append("height", height ? Number(height).toString() : "0");
      bodyFormData.append("length", length ? Number(length).toString() : "0");
      bodyFormData.append("width", width ? Number(width).toString() : "0");
      bodyFormData.append("isActive", isActive ? "true" : "false");
      bodyFormData.append("unitType", type === "BAKERY" ? "ชิ้น" : "กล่อง");

      await createProductTrigger(bodyFormData);
      enqueueSnackbar("สร้างสินค้าใหม่สำเร็จ", { variant: "success" });
      onClose();
      reset();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("เกิดข้อผิดพลาด กรุณาลองใหม่", { variant: "error" });
    }
  });

  const onDropSingleFile = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (newFile) {
        setValue("image", newFile as any, { shouldValidate: true });
      }
    },
    [setValue],
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Paper variant="outlined" sx={{ boxShadow: 0, p: 3 }}>
        <Stack direction="column" spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1" fontWeight={500}>
              สินค้าใหม่
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <RHFUpload
            name="image"
            thumbnail
            onDrop={onDropSingleFile}
            onDelete={() => setValue("image", "", { shouldValidate: true })}
          />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography>การมองเห็น:</Typography>
            <RHFSwitch name="isActive" label={isActive ? "โชว์" : "ซ่อน"} />
          </Stack>

          <Stack direction="row" spacing={1}>
            <RHFTextField
              size="small"
              name="name"
              label="ชื่อสินค้า"
              required
            />
            <RHFTextField
              size="small"
              type="number"
              name="price"
              label="ราคา (บาท)"
              sx={{ width: "50%" }}
              required
            />
          </Stack>

          <RHFTextField name="description" label="รายละเอียดสินค้า" />

          <Stack direction="row" spacing={1}>
            <RHFSelect name="type" label="หมวดหมู่" size="small" required>
              {TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            {type === "BAKERY" && (
              <RHFSelect
                size="small"
                name="category"
                label="หมวดหมู่ย่อย"
                required={type === "BAKERY"}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <RHFTextField
              size="small"
              type="number"
              name="minQty"
              label="จำนวนสินค้าขั้นต่ำ"
              required
            />
            <RHFTextField
              size="small"
              type="number"
              name="quantity"
              label="จำนวนสินค้าปัจจุบัน"
              required
            />
          </Stack>

          <Typography>ขนาด</Typography>

          <Stack direction="row" spacing={1}>
            <RHFTextField
              type="number"
              size="small"
              name="width"
              label="กว้าง (ซม.)"
              required
            />
            <RHFTextField
              type="number"
              size="small"
              name="length"
              label="ยาว (ซม.)"
              required
            />
            <RHFTextField
              type="number"
              size="small"
              name="height"
              label="สูง (ซม.)"
              required
            />
          </Stack>
          <RHFTextField
            type="number"
            size="small"
            name="weight"
            label="น้ำหนัก (กรัม)"
            required
          />

          <LoadingButton
            type="submit"
            size="large"
            color="secondary"
            variant="contained"
            loading={createProductIsLoading}
          >
            เพิ่มสินค้า
          </LoadingButton>
        </Stack>
      </Paper>
    </FormProvider>
  );
}
