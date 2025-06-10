import {
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Stack,
    TextField,
    Typography
} from "@mui/material";


export default function SiteConfiguration() {


  return (
    <Stack spacing={2}>
      <Typography variant="h4" data-i18n="siteConfiguration.title">Site Configuration</Typography>
      <TextField required id="outlined-basic" label="Friendly Name" data-i18n-label="siteConfiguration.friendlyNameLabel" variant="outlined" type="string" />
      <TextField required id="outlined-basic" label="Server Address" data-i18n-label="configManagement.load.serverAddressLabel" variant="outlined" type="string" />
      <TextField required id="outlined-basic" label="Username" data-i18n-label="login.usernamePlaceholder" variant="outlined" type="string" />
      <TextField required id="outlined-basic" label="Password" data-i18n-label="login.passwordPlaceholder" variant="outlined" type="password" />
      <FormGroup>
        <FormControlLabel control={<Checkbox />} label="HTTPS?" data-i18n-label="siteConfiguration.httpsLabel" />
      </FormGroup>
      <Button color="success" variant="contained" data-i18n="adjudicationDetail.submitButton">Submit</Button>
    </Stack>
  );
}