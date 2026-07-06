import { Box } from "@chakra-ui/react";
import { Fragment } from "react";
import { range } from "~/ui/array";

//------------------------------------------------------------------------------
// Print Deck Print Mode Crop Marks
//------------------------------------------------------------------------------

export type PrintDeckPrintModeCropMarksProps = {
  bleedX: number;
  bleedY: number;
  cardH: number;
  cardW: number;
  color: string;
  columns: number;
  length: number;
  offsetX: number;
  offsetY: number;
  rows: number;
};

export default function PrintDeckPrintModeCropMarks({
  bleedX,
  bleedY,
  cardH,
  cardW,
  color,
  columns,
  length,
  offsetX,
  offsetY,
  rows,
}: PrintDeckPrintModeCropMarksProps) {
  return (
    <>
      <CropMarksH
        bleedY={bleedY}
        cardH={cardH}
        color={color}
        offsetX={offsetX - length}
        offsetY={offsetY}
        rows={rows}
        w={length}
      />

      <CropMarksH
        bleedY={bleedY}
        cardH={cardH}
        color={color}
        offsetX={offsetX + columns * cardW}
        offsetY={offsetY}
        rows={rows}
        w={length}
      />

      <CropMarksV
        bleedX={bleedX}
        cardW={cardW}
        color={color}
        columns={columns}
        h={length}
        offsetX={offsetX}
        offsetY={offsetY - length}
      />

      <CropMarksV
        bleedX={bleedX}
        cardW={cardW}
        color={color}
        columns={columns}
        h={length}
        offsetX={offsetX}
        offsetY={offsetY + rows * cardH}
      />
    </>
  );
}

//------------------------------------------------------------------------------
// Crop Marks H
//------------------------------------------------------------------------------

type CropMarksHProps = {
  bleedY: number;
  cardH: number;
  color: string;
  offsetX: number;
  offsetY: number;
  rows: number;
  w: number;
};

function CropMarksH({
  bleedY,
  cardH,
  color,
  offsetX,
  offsetY,
  rows,
  w,
}: CropMarksHProps) {
  return (
    <>
      {range(rows).map((c) => (
        <Fragment key={c}>
          <Box
            bgColor={color}
            h="1px"
            left={`${offsetX}in`}
            position="absolute"
            top={`${offsetY + (bleedY - px1) + c * cardH}in`}
            w={`${w}in`}
          />
          <Box
            bgColor={color}
            h="1px"
            left={`${offsetX}in`}
            position="absolute"
            top={`${offsetY + (cardH - bleedY) + c * cardH}in`}
            w={`${w}in`}
          />
        </Fragment>
      ))}
    </>
  );
}

//------------------------------------------------------------------------------
// Crop Marks V
//------------------------------------------------------------------------------

type CropMarksVProps = {
  bleedX: number;
  cardW: number;
  color: string;
  columns: number;
  h: number;
  offsetX: number;
  offsetY: number;
};

function CropMarksV({
  bleedX,
  cardW,
  color,
  columns,
  h,
  offsetX,
  offsetY,
}: CropMarksVProps) {
  return (
    <Fragment>
      {range(columns).map((c) => (
        <Fragment key={c}>
          <Box
            bgColor={color}
            h={`${h}in`}
            left={`${offsetX + (bleedX - px1) + c * cardW}in`}
            position="absolute"
            top={`${offsetY}in`}
            w="1px"
          />
          <Box
            bgColor={color}
            h={`${h}in`}
            left={`${offsetX + (cardW - bleedX) + c * cardW}in`}
            position="absolute"
            top={`${offsetY}in`}
            w="1px"
          />
        </Fragment>
      ))}
    </Fragment>
  );
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const px1 = 1 / 96;
