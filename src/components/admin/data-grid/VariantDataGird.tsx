"use client";

import { Dispatch, SetStateAction } from "react";
import { Box, Card, alpha, Typography, ListItemText } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";

import { CustomNoRowsOverlay } from "./CustomNoRowsOverlay";

// ----------------------------------------------------------------------

type Props = {
  rows: any;
  rowSelectionModel: GridRowSelectionModel;
  setRowSelectionModel: Dispatch<SetStateAction<GridRowSelectionModel>>;
};

// ----------------------------------------------------------------------

export default function VariantDataGrid({
  rows,
  rowSelectionModel,
  setRowSelectionModel,
}: Props) {
  const columns: GridColDef[] = [
    {
      field: "variantType",
      headerName: "ประเภทตัวเลือก",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => {
        let text;
        switch (params.row.variantType) {
          case "cream":
            text = "ครีม";
            break;
          case "topBorder":
            text = "ขอบบน";
            break;
          case "bottomBorder":
            text = "ขอบล่าง";
          case "decoration":
            text = "ลายรอบเค้ก";
          case "surface":
            text = "หน้าเค้ก";
        }

        return (
          <>
            <Box
              width={6}
              height={52}
              sx={{
                backgroundColor: "secondary.main",
                position: "absolute",
                left: 0,
                visibility:
                  params.id === rowSelectionModel[0] ? "visible" : "hidden",
              }}
            />
            <Typography variant="body2" fontFamily="IBM Plex Sans Thai" ml={1}>
              {text}
            </Typography>
          </>
        );
      },
    },
    { field: "variantName", headerName: "ชื่อตัวเลือก", flex: 1 },
    {
      field: "isActive",
      headerName: "สถานะ",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => {
        let text;
        let bgColor;
        let textColor;
        switch (params.value) {
          case true:
            text = "Active";
            textColor = "#007B55";
            bgColor = alpha("#00AB55", 0.16);
            break;
          case false:
            text = "Inactive";
            textColor = "#B71D18";
            bgColor = alpha("#FF5630", 0.16);
            break;
          default:
            text = "None";
        }
        return (
          <Box sx={{ bgcolor: bgColor, borderRadius: 1.6, px: 1.25, py: 0.5 }}>
            <Typography
              variant="caption"
              fontFamily="IBM Plex Sans Thai"
              fontWeight={600}
              color={textColor}
            >
              {text}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "lastUpdated",
      headerName: "เปลี่ยนแปลงล่าสุด",
      flex: 1,
      renderCell: (params) => (
        <ListItemText
          primary={<Typography variant="body2">30/08/2023</Typography>}
          secondary={
            <>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="caption"
              >
                02:30 น.
              </Typography>
            </>
          }
        />
      ),
    },
  ];

  return (
    <Card sx={{ boxShadow: 0 }}>
      <div style={{ height: 780 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnMenu
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
          columnHeaderHeight={45}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </div>
    </Card>
  );
}
