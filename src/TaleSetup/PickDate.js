import { useCallback, useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Card, CardHeader, CardContent, Stack, Grid } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FetchArtist } from "./FetchArtist";
import dayjs from "dayjs";


function PickDate({
  updateStartDateInParent,
  updateEndDateInParent,
  artistName,
  newArtistList,
  openDialog
}) {
  let cachedStartDate = localStorage.getItem("startDate");
  let cachedEndDate = localStorage.getItem("endDate");

  const today = new Date();
  const oneYearFromNow = new Date(today);
  oneYearFromNow.setFullYear(today.getFullYear() + 1);

  const [startDate, setStartDate] = useState(
    cachedStartDate ? new Date(Date.parse(cachedStartDate)) : new Date()
  );
  const [endDate, setEndDate] = useState(
    cachedEndDate ? new Date(Date.parse(cachedEndDate)) : oneYearFromNow
  );

  const updateStartDate = useCallback((date) => {
    if (date > endDate) {
      alert("Start date must be before the end date!");
      return;
    }
    setStartDate(date);
    window.localStorage.setItem("startDate", date.toISOString());
    updateStartDateInParent(date);
    if (artistName) {
      FetchArtist(artistName, date, endDate).then((resJson) => {
        newArtistList(resJson);
        openDialog(true);
      });
    }
  }, [artistName, endDate]);

  const updateEndDate = useCallback((date) => {
    if (date < startDate) {
      alert("End date must be after the start date!");
      return;
    }

    setEndDate(date);
    window.localStorage.setItem("endDate", date.toISOString());
    updateEndDateInParent(date);
    if (artistName) {
      FetchArtist(artistName, startDate, date).then((resJson) => {
        newArtistList(resJson);
        openDialog(true);
      });
    }
  }, [artistName, startDate]);

  useEffect(() => {
    if (startDate) updateStartDateInParent(startDate);
    if (endDate) updateEndDateInParent(endDate);
  }, [startDate, endDate]);

  // Display spotify token
  return (
    <Grid width="100%">
      <Card sx={{ backgroundColor: "#70afbf", height: '100%' }}>
        <CardHeader
          title="Pick your dates"
          sx={{ backgroundColor: "#5e97a5", color: "white", p: 1 }}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent >
          <Stack direction={"column"} spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                sx={{
                  "& input": {
                    color: "white",
                  },
                  "& label": {
                    color: "white",
                  },
                  "& svg": {
                    color: "white",
                  },
                }}
                label="StartDate: "
                value={dayjs(startDate)}
                onChange={updateStartDate}
              />
              <DatePicker
                sx={{
                  "& input": {
                    color: "white",
                  },
                  "& label": {
                    color: "white",
                  },
                  "& svg": {
                    color: "white",
                  },
                }}
                label="EndDate: "
                value={dayjs(endDate)}
                onChange={updateEndDate}
                minDate={dayjs(startDate)} // Prevents selecting dates before startDate
              />
            </LocalizationProvider>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default PickDate;
