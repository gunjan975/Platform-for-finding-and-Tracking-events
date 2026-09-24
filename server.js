const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let rsvps = {};
let invites = {};

app.get("/api/events", async (req, res) => {
    try {
        const keyword = req.query.keyword || "music";

        let url;

        if (keyword.toLowerCase() === "sports") {
            url =
                `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&classificationName=Sports&size=20`;
        }
        else if (keyword.toLowerCase() === "music") {
            url =
                `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&classificationName=Music&size=20`;
        }
        else if (keyword.toLowerCase() === "comedy") {
            url =
                `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&keyword=comedy&size=20`;
        }
        else {
            url =
                `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&keyword=${encodeURIComponent(keyword)}&size=20`;
        }

        const response = await fetch(url);
        const data = await response.json();

        console.log("Events received:", data._embedded?.events?.length || 0);

        const events = data._embedded?.events || [];

        res.json(events);

    } catch (error) {
        console.error("Ticketmaster error:", error);

        res.status(500).json({
            error: "Failed to fetch events"
        });
    }
});

app.post("/api/rsvp", (req, res) => {

    const { eventId } = req.body;

    if (!rsvps[eventId]) {
        rsvps[eventId] = 0;
    }

    rsvps[eventId]++;

    res.json({
        success: true,
        attendees: rsvps[eventId]
    });
});

app.post("/api/invite", (req, res) => {

    const { eventId } = req.body;

    const code =
        Math.random().toString(36).substring(2, 10);

    invites[code] = {
        eventId,
        clicks: 0,
        friends: 0
    };

    res.json({
        code,
        shareUrl:
            `${req.protocol}://${req.get("host")}/invite.html?code=${code}`
    });
});

app.get("/api/invite/:code", (req, res) => {

    const invite = invites[req.params.code];

    if (!invite) {
        return res.status(404).json({
            error: "Invalid invite"
        });
    }

    invite.clicks++;

    res.json(invite);
});

app.get("/api/events", async (req, res) => {
    try {
        const keyword = req.query.keyword || "music";

        let url =
            `https://app.ticketmaster.com/discovery/v2/events.json` +
            `?apikey=${process.env.TICKETMASTER_API_KEY}` +
            `&size=20` +
            `&countryCode=US`;

        if (keyword.toLowerCase() === "sports") {
            url += `&classificationName=Sports`;
        } 
        else if (keyword.toLowerCase() === "music") {
            url += `&classificationName=Music`;
        } 
        else if (keyword.toLowerCase() === "comedy") {
            url += `&keyword=comedy`;
        } 
        else {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        let events = data._embedded?.events || [];

        console.log(
            `Ticketmaster returned ${events.length} events for ${keyword}`
        );

        // Fallback demo events if Ticketmaster returns nothing
        if (events.length === 0) {
            events = [
                {
                    id: "demo-sports-1",
                    name: "Championship Sports Night",
                    dates: {
                        start: {
                            localDate: "2026-10-10",
                            localTime: "19:00:00"
                        }
                    },
                    images: [
                        {
                            url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"
                        }
                    ],
                    _embedded: {
                        venues: [
                            {
                                name: "City Sports Arena",
                                city: {
                                    name: "New York"
                                }
                            }
                        ]
                    }
                },
                {
                    id: "demo-sports-2",
                    name: "Live Football Tournament",
                    dates: {
                        start: {
                            localDate: "2026-10-15",
                            localTime: "18:30:00"
                        }
                    },
                    images: [
                        {
                            url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800"
                        }
                    ],
                    _embedded: {
                        venues: [
                            {
                                name: "Central Stadium",
                                city: {
                                    name: "Los Angeles"
                                }
                            }
                        ]
                    }
                },
                {
                    id: "demo-sports-3",
                    name: "Basketball Live",
                    dates: {
                        start: {
                            localDate: "2026-10-22",
                            localTime: "20:00:00"
                        }
                    },
                    images: [
                        {
                            url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800"
                        }
                    ],
                    _embedded: {
                        venues: [
                            {
                                name: "Downtown Arena",
                                city: {
                                    name: "Chicago"
                                }
                            }
                        ]
                    }
                }
            ];
        }

        res.json(events);

    } catch (error) {

        console.error("Ticketmaster error:", error);

        res.status(500).json({
            error: "Failed to fetch events"
        });
    }
});
app.listen(PORT, () => {
    console.log(`Event platform running at http://localhost:${PORT}`);
});