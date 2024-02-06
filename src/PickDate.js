import DatePicker from "react-datepicker";
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css";

function PickDate({ updateStartDateInParent, updateEndDateInParent }) {
    let cachedStartDate = localStorage.getItem('startDate');
    let cachedEndDate = localStorage.getItem('endDate');

    const today = new Date();
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    const [startDate, setStartDate] = useState(cachedStartDate === null ? new Date() : new Date(cachedStartDate));
    const [endDate, setEndDate] = useState(cachedEndDate === null ? oneYearFromNow : new Date(cachedEndDate));

    useEffect(() => { updateStartDateInParent(startDate); updateEndDateInParent(endDate) }, [])
    // Display spotify token 
    return (
        <div>
            <div>
                StartDate: <DatePicker selected={startDate} onChange={(date) => { setStartDate(date); window.localStorage.setItem("startDate", date); updateStartDateInParent(date); }} />
            </div>
            <div>
                EndDate: <DatePicker selected={endDate} onChange={(date) => { setEndDate(date); window.localStorage.setItem("endDate", date); updateEndDateInParent(date); }} />
            </div>
        </div>
    );
}

export default PickDate;


