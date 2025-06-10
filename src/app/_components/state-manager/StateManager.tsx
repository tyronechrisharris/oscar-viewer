/*
 * Copyright (c) 2024.  Botts Innovative Research, Inc.
 * All Rights Reserved
 */

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container, Snackbar, SnackbarCloseReason,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

import {useSelector} from "react-redux";
import { selectDefaultNode, selectNodes, setNodes} from "@/lib/state/OSHSlice";
import React, {useCallback, useEffect, useState} from "react";
import { selectCurrentUser, setCurrentUser} from "@/lib/state/OSCARClientSlice";
import {useAppDispatch} from "@/lib/state/Hooks";
import {Node, NodeOptions, insertObservation} from "@/lib/data/osh/Node";
import Divider from "@mui/material/Divider";
import ObservationFilter from "osh-js/source/core/consysapi/observation/ObservationFilter";
import ConfigData, {
    getConfigDataStreamID, getConfigSystemID,
    retrieveLatestConfigDataStream
} from "./Config";
import {RootState} from "@/lib/state/Store";


export default function StateManager() {
    const dispatch = useAppDispatch();
    const defaultNode = useSelector((state: RootState) => state.oshSlice.configNode);
    const [configDSId, setConfigDSId] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("config");

    const newNodeOpts: NodeOptions = {
        name: "",
        address: "localhost",
        port: 0,
        oshPathRoot: "/sensorhub",
        sosEndpoint: "/sos",
        configsEndpoint: "/config",
        csAPIEndpoint: "/api",
        auth: {username: "", password: ""},
        isSecure: false,
        isDefaultNode: false
    };

    const [loadNodeOpts, setLoadNodeOpts] = useState<NodeOptions>(newNodeOpts);
    const [targetNode, setTargetNode] = useState<Node>(new Node(newNodeOpts));

    const [activeAlert, setActiveAlert] =useState<'save'| 'load'| 'saveload' | null>(null);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [openSaveSnack, setOpenSaveSnack] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);

    const [loadSnackMsg, setLoadSnackMsg] = useState<string>();
    const [saveSnackMsg, setSaveSnackMsg] = useState<string>();


    const [colorSaveStatus, setSaveColorStatus]= useState('');
    const [colorLoadStatus, setLoadColorStatus]= useState('');

    const nodes = useSelector(selectNodes)
    const currentUser = useSelector(selectCurrentUser)

    useEffect(() => {
        setLoadNodeOpts({...loadNodeOpts, ...defaultNode});
    }, []);


    const getConfigDataStream = useCallback(async () =>{
        if(defaultNode){
            let configSystemId = await getConfigSystemID(defaultNode);

            if(configSystemId){
                let dsId = await getConfigDataStreamID(defaultNode);
                setConfigDSId(dsId);

                return dsId;
            }
        }
    },[defaultNode]);

    const saveConfigState = async() =>{

        let dsId = await getConfigDataStream();

        if(!dsId){
            setSaveSnackMsg('Failed to find config datastream')
            setSaveColorStatus('error')
            setOpenSaveSnack(true);
        }

        let phenomenonTime = new Date().toISOString();

        const user = currentUser || "Unknown";

        const tempData = new ConfigData(
            phenomenonTime,
            configDSId || "",
            user,
            nodes,
            nodes.length
        );

        let observation = tempData.createConfigurationObservation();

        const endpoint = defaultNode.getConfigEndpoint(false) + "/datastreams/" + dsId + "/observations";

        await submitConfig(endpoint, observation);
    }

    const submitConfig = async(endpoint: string, observation: any) => {
        try{
            const response = await insertObservation(endpoint, observation);

            if(response.ok){
                setSaveSnackMsg('OSCAR Configuration Saved')
                setSaveColorStatus('success')
            }else {
                setSaveSnackMsg('Failed to save OSCAR Configuration')
                setSaveColorStatus('error')
            }
        }catch(error){
            setSaveSnackMsg('Failed to save config')
            setSaveColorStatus('error')
        }

        setOpenSaveSnack(true);
        setActiveAlert(null)
    }


    const handleLoadState = async () => {

        let latestConfigDs = await retrieveLatestConfigDataStream(targetNode);


        if(latestConfigDs){

            let latestConfigData = await fetchLatestConfigObservation(latestConfigDs);

            if(latestConfigData != null){
                setLoadSnackMsg('OSCAR State Loaded')
                setLoadColorStatus('success')

                dispatch(setCurrentUser(latestConfigData[0].user));

                let nodes = latestConfigData[0].nodes;
                dispatch(setNodes(nodes));
            }

        }else{
            setLoadSnackMsg('Failed to load OSCAR State')
            setLoadColorStatus('error')
        }
        setOpenSnack(true)
        setActiveAlert(null)
    }

    const handleChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (name === "File Name") {
            setFileName(value);
        }
    }

     const fetchLatestConfigObservation = async(ds: any) =>{
        const observations = await ds.searchObservations(new ObservationFilter({ resultTime: 'latest'}), 1);


        let obsResult = await observations.nextPage();
        let configData = obsResult.map((obs: any) =>{
            let data = new ConfigData(obs.phenomenonTime, obs.id, obs.result.user, obs.result.nodes, obs.result.numNodes)
            return data;
        })

        return configData;

    }

    const handleChangeLoadForm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        switch (name) {
            case "address":
                setLoadNodeOpts({...loadNodeOpts, address: value});
                break;
            case "port":
                setLoadNodeOpts({...loadNodeOpts, port: Number.parseInt(value)});
                break;
            case "sosEndpoint":
                setLoadNodeOpts({...loadNodeOpts, oshPathRoot: value});
                break;
            case "csAPIEndpoint":
                setLoadNodeOpts({...loadNodeOpts, csAPIEndpoint: value});
                break;
            case "username":
                setLoadNodeOpts({...loadNodeOpts, auth: {...loadNodeOpts.auth, username: value}});
                break;
            case "password":
                setLoadNodeOpts({...loadNodeOpts, auth: {...loadNodeOpts.auth, password: value}});
                break;
        }
    }



    useEffect(() => {
        setTargetNode(new Node(loadNodeOpts));

    }, [loadNodeOpts]);


    const handleCloseSnack = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason,) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnack(false);
        setOpenSaveSnack(false);
    };

    const handleSaveLoadState = async() =>{
        await saveConfigState();
        await handleLoadState();

    }

    return (
        <Box sx={{margin: 2, padding: 2, width: isSmallScreen ? '100%' : '75%'}}>
            <Card>
                <CardHeader title={"Configuration Management"} data-i18n-title="configManagement.title" titleTypographyProps={{variant: "h2"}}/>
                <CardContent component="form">
                    <Box>
                        <Stack spacing={3} divider={<Divider orientation={"horizontal"} flexItem/>} direction="column">

                            <Card variant={"outlined"}>
                                <CardHeader title={"Save Config Options"} data-i18n-title="configManagement.save.title"/>
                                <CardContent>
                                    <Stack spacing={2}>

                                        <TextField label="File Name" data-i18n-label="configManagement.save.fileNameLabel" value={fileName} onChange={handleChangeForm}/>
                                        <Button onClick={() => setActiveAlert('save')} variant={"contained"} color={"primary"}
                                                disabled={activeAlert ==='save'} data-i18n="configManagement.save.saveButton">
                                            Save
                                        </Button>
                                        <Button onClick={() => setActiveAlert('saveload')} variant={"outlined"} color={"primary"}
                                                disabled={activeAlert === 'saveload'} data-i18n="configManagement.save.saveAndLoadButton">
                                            Save and Load
                                        </Button>
                                        {activeAlert === 'saveload' && (
                                            <Alert severity={"warning"}>
                                                <AlertTitle data-i18n="configManagement.save.confirmAlert.title">Please Confirm</AlertTitle>
                                                <Stack spacing={2} direction={"row"}>
                                                    <Typography data-i18n="configManagement.save.confirmAlert.saveAndLoadMessage">
                                                        Are you sure you want to save and load the current configuration (and overwrite
                                                        the previous one)?
                                                    </Typography>
                                                    <Button color={"success"} variant="contained" onClick={handleSaveLoadState} data-i18n="configManagement.save.saveButton">
                                                        Save
                                                    </Button>
                                                    <Button color={"error"} variant="contained" onClick={() => setActiveAlert(null)} data-i18n="configManagement.save.cancelButton">
                                                        Cancel
                                                    </Button>
                                                </Stack>
                                            </Alert>
                                        )}
                                        {activeAlert ==='save' && (
                                            <Alert severity={"warning"}>
                                                <AlertTitle data-i18n="configManagement.save.confirmAlert.title">Please Confirm</AlertTitle>

                                                <Stack spacing={2} direction={"row"}>
                                                    <Typography data-i18n="configManagement.save.confirmAlert.saveMessage">
                                                        Are you sure you want to save the configuration (and overwrite
                                                        the previous one)?
                                                    </Typography>
                                                    <Button color={"success"} variant="contained"
                                                            onClick={saveConfigState} data-i18n="configManagement.save.saveButton">
                                                        Save
                                                    </Button>
                                                    <Button color={"error"} variant="contained"
                                                            onClick={() => setActiveAlert(null)} data-i18n="configManagement.save.cancelButton">
                                                        Cancel
                                                    </Button>
                                                </Stack>

                                            </Alert>
                                        )}
                                        {/* TODO: Snackbar message is dynamic (saveSnackMsg) */}
                                        <Snackbar
                                            data-i18n="configManagement.save.snackbarMessage"
                                            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                                            open={openSaveSnack}
                                            autoHideDuration={5000}
                                            onClose={handleCloseSnack}
                                            message={saveSnackMsg}
                                            sx={{
                                                '& .MuiSnackbarContent-root': {
                                                    backgroundColor: colorSaveStatus === 'success' ? 'green' : 'red',
                                                },
                                            }}
                                        />
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card variant={"outlined"}>
                                <CardHeader title={"Load Config Options"} data-i18n-title="configManagement.load.title"/>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <TextField label="Server Address" data-i18n-label="configManagement.load.serverAddressLabel" name="address" value={loadNodeOpts.address}
                                                   onChange={handleChangeLoadForm}/>
                                        <TextField label="Server Port" data-i18n-label="configManagement.load.serverPortLabel" name="port" value={loadNodeOpts.port}
                                                   onChange={handleChangeLoadForm}/>
                                        <TextField label="Server Endpoint" data-i18n-label="configManagement.load.serverEndpointLabel" name="sosEndpoint"
                                                   value={loadNodeOpts.oshPathRoot}
                                                   onChange={handleChangeLoadForm}/>
                                        <TextField label="API Endpoint" data-i18n-label="configManagement.load.apiEndpointLabel" name="csAPIEndpoint"
                                                   value={loadNodeOpts.csAPIEndpoint}
                                                   onChange={handleChangeLoadForm}/>
                                        <TextField label="Server Username" data-i18n-label="configManagement.load.serverUsernameLabel" name="username"
                                                   value={loadNodeOpts.auth.username}
                                                   onChange={handleChangeLoadForm}/>
                                        <TextField label="Server Password" data-i18n-label="configManagement.load.serverPasswordLabel" name="password"
                                                   value={loadNodeOpts.auth.password}
                                                   onChange={handleChangeLoadForm} type={"password"}/>

                                        <Button onClick={() => setActiveAlert('load')} variant={"contained"} color={"primary"}
                                                disabled={activeAlert === 'load'} data-i18n="configManagement.load.loadStateButton">
                                            Load State
                                        </Button>
                                        {activeAlert === 'load' && (
                                            <Alert severity={"warning"}>
                                                <AlertTitle data-i18n="configManagement.save.confirmAlert.title">Please Confirm</AlertTitle>
                                                <Container>
                                                    <Stack spacing={2} direction={"row"}>
                                                        <Typography data-i18n="configManagement.load.confirmAlert.loadMessage">
                                                            Are you sure you want to load the configuration (and
                                                            overwrite the previous one)?
                                                        </Typography>
                                                        <Button variant={"contained"} color={"success"} onClick={handleLoadState} data-i18n="configManagement.load.yesButton">
                                                            Yes
                                                        </Button>
                                                        <Button color={"error"} variant="contained" onClick={() => setActiveAlert(null)} data-i18n="configManagement.save.cancelButton">
                                                            Cancel
                                                        </Button>
                                                    </Stack>
                                                </Container>
                                            </Alert>
                                        )}
                                        {/* TODO: Snackbar message is dynamic (loadSnackMsg) */}
                                        <Snackbar
                                            data-i18n="configManagement.load.snackbarMessage"
                                            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                                            open={openSnack}
                                            autoHideDuration={5000}
                                            onClose={handleCloseSnack}
                                            message={loadSnackMsg}
                                            sx={{
                                                '& .MuiSnackbarContent-root': {
                                                    backgroundColor: colorLoadStatus === 'success' ? 'green' : 'red',
                                                },
                                            }}
                                        />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

