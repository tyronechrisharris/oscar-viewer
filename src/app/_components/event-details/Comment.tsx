"use client";

import { Avatar, Box, Paper, Stack, TextField, Typography } from "@mui/material";
import { SelectedEvent } from "../../../../types/new-types";
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import { useState } from "react";

export default function Comment(props: {
  event: SelectedEvent;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "File1.pdf", "File2.pdf", "File3.pdf"
  ]);
  
  return (
    <Stack direction={"column"} p={2} spacing={2}>
      <Stack direction={"row"} spacing={2} justifyContent={"start"} alignItems={"center"}>
        <Avatar>OP</Avatar>
        <Typography variant="h6" data-i18n="eventDetails.comment.usernameLabel">Username</Typography>
      </Stack>
      <TextField
        id="outlined-multiline-static"
        label="Notes" data-i18n-label="eventDetails.comment.notesLabel"
        multiline
        rows={4}
        disabled
        value={"Insert comments here"} data-i18n-value="eventDetails.comment.notesValue"
      />
      {uploadedFiles.length > 0 && (
        <Paper variant='outlined' sx={{ width: "100%" }}>
          <Stack
            sx={{
              maxHeight: '100px', // Adjust height based on item size
              overflowY: 'auto',
              p: 2,
            }}
            spacing={1}
          >
            {uploadedFiles.map((file, index) => (
              <Box display={"flex"} sx={{wordSpacing: 2}}>
                <InsertDriveFileRoundedIcon />
                <Typography variant="body1">{file}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}