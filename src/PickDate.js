import DatePicker from "react-datepicker";
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css";

function PickDate({ updateStartDateInParent, updateEndDateInParent }) {

    const today = new Date();
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    useEffect(()=>{setStartDate(today); setEndDate(oneYearFromNow);},[])

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


