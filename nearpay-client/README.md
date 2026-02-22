# Nearpay Client

## How to Run locally
1. Ensure you have Node.js installed.
2. Clone the repository to your local machine.
3. In the `nearpay-client` directory, run `npm install` to install dependencies.
4. Create a `.env.local` file with the server URL configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4200/api/v1
   ```
5. Run `npm run dev` to start the development server. The server usually runs on `http://localhost:3000`.

## Booking Logic
The booking logic follows these general steps:
1. **Provider Availability**: We fetch the target provider's specific availability settings, which dictate the working days and their operating hours (e.g. 09:00 - 17:00), along with any explicitly blocked out days.
2. **Date Selection**: The calendar allows users to select valid days. Days are restricted to the future. If a provider hasn't set their availability, then all days are unbookable. Weekdays that match the provider's `workingDays` are valid if not present in the `blockedDates` array.
3. **Timeslot Calculation**: Once a valid day is chosen, the application queries the backend for the available timeslots. The backend calculates potential starting times based on the provider's valid shift minus overlapping time of pre-existing bookings. The duration required is the service's duration.
4. **Reserving**: The user picks an open slot and confirms. A booking is generated restricting that time space on the specified date so no one else can book over it.

## Assumptions Made
- The provider schedule uses the local timezone. We assume providers operate in relative standard time since there is no timezone conversion handling explicitly encoded.
- Since there is no actual payment processing logic in place, a booking creates an instantaneous active appointment in the application database simply acting as an appointment placeholder.
- Role-based redirection occurs on login (e.g. `user` goes to main service listings, `provider` goes to provider-specific dashboard) to segregate functionality between two different types of audiences organically.
