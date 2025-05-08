import { useCallback, useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Card, CardHeader, CardContent, Stack, Grid } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FetchArtist } from "./FetchArtist";

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
    cachedStartDate === null ? new Date() : new Date(cachedStartDate)
  );
  const [endDate, setEndDate] = useState(
    cachedEndDate === null ? oneYearFromNow : new Date(cachedEndDate)
  );

  const updateEndDate = useCallback((date) => {
    setEndDate(date);
    window.localStorage.setItem("endDate", date);
    updateEndDateInParent(date);
    FetchArtist(artistName, startDate, date).then((resJson) => {
      newArtistList(resJson);
      openDialog(true);
    });
  }, [artistName]);

  useEffect(() => {
    updateStartDateInParent(startDate);
    updateEndDateInParent(endDate);
  }, []);
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
                defaultValue={dayjs(startDate)}
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  window.localStorage.setItem("startDate", date);
                  updateStartDateInParent(date);
                }}
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
                defaultValue={dayjs(endDate)}
                selected={endDate}
                onChange={updateEndDate}
              />
            </LocalizationProvider>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default PickDate;
