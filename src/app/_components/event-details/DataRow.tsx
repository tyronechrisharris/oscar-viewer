"use client";

import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {useSelector} from "react-redux";
import {styled, Theme} from "@mui/material/styles";
import {selectEventData} from "@/lib/state/EventDetailsSlice";


const StatusTableCell = styled(TableCell)(({theme, status}: { theme: Theme, status: string }) => ({
    color: status === 'Gamma' ? theme.palette.error.contrastText : status === 'Neutron' ? theme.palette.info.contrastText : status === 'Gamma & Neutron' ? theme.palette.secondary.contrastText : 'inherit',
    backgroundColor: status === 'Gamma' ? theme.palette.error.main : status === 'Neutron' ? theme.palette.info.main : status === 'Gamma & Neutron' ? theme.palette.secondary.main : 'transparent',
}));


export default function DataRow() {
    const eventData = useSelector(selectEventData);

    return (
        <TableContainer>
            <Table sx={{minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow
                        sx={{'&:last-child td, &:last-child th': {border: 0, textAlign: "center"}}}>
                        <TableCell data-i18n="eventDetails.dataRow.header.secondaryInspection">Secondary Inspection</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.laneId">Lane ID</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.occupancyId">Occupancy ID</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.startTime">Start Time</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.endTime">End Time</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.maxGamma">Max Gamma</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.maxNeutron">Max Neutron</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.status">Status</TableCell>
                        <TableCell data-i18n="eventDetails.dataRow.header.adjudicated">Adjudicated</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eventData ? (
                        <TableRow key={eventData.id}
                                  sx={{'&:last-child td, &:last-child th': {border: 0, textAlign: "center"}}}>
                            <TableCell>{eventData?.secondaryInspection}</TableCell>
                            <TableCell>{eventData?.laneId}</TableCell>
                            <TableCell>{eventData?.occupancyId}</TableCell>
                            <TableCell>{eventData?.startTime}</TableCell>
                            <TableCell>{eventData?.endTime}</TableCell>
                            <TableCell>{eventData?.maxGamma}</TableCell>
                            <TableCell>{eventData?.maxNeutron}</TableCell>
                            {/* TODO: Content is dynamic (eventData?.status). Key 'eventDetails.dataRow.value.unknown' exists. */}
                            <StatusTableCell status={eventData?.status || 'Unknown'} data-i18n="eventDetails.dataRow.statusValue">
                                {eventData?.status || 'Unknown'}
                            </StatusTableCell>
                            {/* TODO: Content is dynamic (isAdjudicated ? 'Yes' : 'No'). Keys 'eventDetails.dataRow.value.yes' and 'eventDetails.dataRow.value.no' exist. */}
                            <TableCell data-i18n="eventDetails.dataRow.adjudicatedValue">{eventData.isAdjudicated ? "Yes" : "No"}</TableCell>
                        </TableRow>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} align="center" data-i18n="eventDetails.dataRow.noEventData">No event data available</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

