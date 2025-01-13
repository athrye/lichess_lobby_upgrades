# Lichess lobby upgrades

> Athrye Kronczyk (2025)

Hacky work in progress to upgrade the lichess lobby experience. 

With the stock site you only see the list of players, and you have to mouseover and wait for a popup with more information (like whether you follow them, the cross table score, etc). 

This extension moves some of that info right into the main table so that you don't have to interactively trigger and wait for a bunch of pop-ups.

**The first userscript enhances the Lichess lobby by showing a small "(F)" indicator next to users you follow**. This makes it easier to spot games from players you're interested in. Here's what it looks like (see the labels besides the handles on the 2nd and 6th rows) 

![image](https://github.com/user-attachments/assets/f2efba44-bda7-4119-83bf-0a572d01d03b)

_DISCLAIMER: This kind of thing is way outside of my technical wheelhouse, so use at your own risk, and please don't judge my code too harshly._ Please feel free to use/modify/etc and let me know if you have any cool ideas or suggestions.

## Features

- Shows a gold "(F)" next to usernames of players you follow in the lobby
- Configurable to show markers either everywhere or only in the first column
- Makes only one API call on page load to fetch your followed users list
- Efficient DOM observation to update markers as new games appear
- Optional debug mode for troubleshooting

## Installation

1. Install a userscript manager like Tampermonkey or Greasemonkey in your browser
2. Create a new script and copy the source code from [source.js](source.js)
3. Get your Lichess API token:
   - Go to https://lichess.org/account/oauth/token
   - Create a new access token with `follow:read` permission
   - Copy the token that starts with `lip_`
4. Insert your API token into the script:
   ```javascript
   const AUTH_TOKEN = 'lip_............'; // Replace with your token
   ```
5. Save the script and refresh Lichess

## Configuration

You can modify these constants at the top of the script:

```javascript
const DEBUG_MODE = true;        // Enable/disable debug logging
const LABEL_EVERYWHERE = false; // Show (F) everywhere or just first column
const DEBOUNCE_DELAY = 100;    // Milliseconds to wait before updating after DOM changes
```

## How It Works

1. When the page loads, the script makes a single API call to `https://lichess.org/api/rel/following` to get your list of followed users
2. The script maintains this list in memory and doesn't make additional API calls
3. As new games appear in the lobby, the script checks if the players are in your followed list
4. If a match is found, a gold "(F)" is added next to their username

## Privacy & Security

- Your API token is only stored locally in the script
- The script only requests the minimum required permission (`follow:read`)
- Only one API call is made per page load to minimize server impact
- No data is sent to any third parties

## Development

Enable `DEBUG_MODE` to see detailed logging of:
- API calls and headers
- API response data
- Parsed follow list
- DOM update triggers
