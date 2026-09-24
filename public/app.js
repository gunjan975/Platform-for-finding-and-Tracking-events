let currentEvents = [];


/* LOAD EVENTS */

async function searchEvents() {

    const keyword =
        document.getElementById("searchInput").value.trim()
        || "music";

    loadEvents(keyword);
}


async function loadCategory(category) {

    document.getElementById("searchInput").value = category;

    loadEvents(category);
}


async function loadEvents(keyword = "music") {

    const container =
        document.getElementById("events");

    container.innerHTML =
        `<div class="loading">
            Loading events...
        </div>`;

    try {

        const response =
            await fetch(
                `/api/events?keyword=${encodeURIComponent(keyword)}`
            );

        const events = await response.json();

        currentEvents = events;

        renderEvents(events);

        createCalendar(events);

    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="loading">
                ❌ Unable to load events.
                <br><br>
                Check your Ticketmaster API key.
            </div>`;
    }
}


/* RENDER EVENT CARDS */

function renderEvents(events) {

    const container =
        document.getElementById("events");

    container.innerHTML = "";

    if (!events.length) {

        container.innerHTML =
            `<div class="loading">
                No events found.
            </div>`;

        return;
    }


    events.forEach(event => {

        const venue =
            event._embedded?.venues?.[0]?.name
            || "Venue unavailable";

        const city =
            event._embedded?.venues?.[0]?.city?.name
            || "";

        const date =
            event.dates?.start?.localDate
            || "Date unavailable";

        const time =
            event.dates?.start?.localTime
            || "Time unavailable";

        const image =
            event.images?.[0]?.url
            || "https://via.placeholder.com/600x400";

        const id = event.id;


        const card =
            document.createElement("div");

        card.className = "card";


        card.innerHTML = `

            <img
                class="card-image"
                src="${image}"
                alt="${event.name}"
            >

            <div class="card-content">

                <span class="badge">
                    LIVE EVENT
                </span>

                <h3>
                    ${event.name}
                </h3>

                <div class="meta">
                    📍 ${venue}, ${city}
                </div>

                <div class="meta">
                    📅 ${date}
                </div>

                <div class="meta">
                    🕐 ${time}
                </div>

                <div
                    class="stats"
                    id="stats-${id}"
                >
                    👥 0 people interested
                </div>

                <div class="actions">

                    <button
                        onclick="rsvp('${id}')"
                    >
                        ❤️ Interested
                    </button>

                    <button
                        class="share"
                        onclick="shareEvent('${id}')"
                    >
                        🔗 Share
                    </button>

                </div>

            </div>
        `;


        container.appendChild(card);

        loadStats(id);

    });
}


/* RSVP */

async function rsvp(eventId) {

    try {

        const response =
            await fetch("/api/rsvp", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    eventId
                })

            });


        const data =
            await response.json();


        showToast(
            "❤️ You're interested in this event!"
        );


        loadStats(eventId);

    } catch (error) {

        showToast(
            "Something went wrong."
        );
    }
}


/* SHARE LINK */

async function shareEvent(eventId) {

    try {

        const response =
            await fetch("/api/invite", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    eventId
                })

            });


        const data =
            await response.json();


        await navigator.clipboard.writeText(
            data.shareUrl
        );


        showToast(
            "🔗 Share link copied!"
        );


    } catch (error) {

        showToast(
            "Unable to create share link."
        );
    }
}


/* STATS */

async function loadStats(eventId) {

    try {

        const response =
            await fetch(
                `/api/stats/${eventId}`
            );

        const data =
            await response.json();


        const element =
            document.getElementById(
                `stats-${eventId}`
            );


        if (element) {

            element.innerHTML =
                `👥 ${data.rsvps}
                 people interested
                 •
                 ${data.friends}
                 friends attending`;

        }

    } catch (error) {

        console.log(error);
    }
}


/* CALENDAR */

function createCalendar(events) {

    const calendar =
        document.getElementById("calendar");

    calendar.innerHTML = "";


    const dates = {};

    events.forEach(event => {

        const date =
            event.dates?.start?.localDate;

        if (date) {
            dates[date] = true;
        }

    });


    const today =
        new Date();


    const year =
        today.getFullYear();

    const month =
        today.getMonth();


    const firstDay =
        new Date(year, month, 1).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (let i = 0; i < firstDay; i++) {

        const empty =
            document.createElement("div");

        calendar.appendChild(empty);
    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";


        if (dates[dateString]) {

            cell.classList.add(
                "event-day"
            );

            cell.innerHTML =
                `<strong>${day}</strong>
                 <div class="event-dot">
                    • Event
                 </div>`;

        } else {

            cell.innerHTML =
                `<strong>${day}</strong>`;
        }


        calendar.appendChild(cell);

    }
}


/* TOAST */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.innerText = message;

    toast.style.display = "block";


    setTimeout(() => {

        toast.style.display = "none";

    }, 2500);
}


/* NAVIGATION */

function scrollToEvents() {

    document
        .querySelector(".container")
        .scrollIntoView({
            behavior: "smooth"
        });
}


function showDashboard() {

    showToast(
        "RSVP Dashboard coming next!"
    );
}


/* INITIAL LOAD */

loadEvents("music");