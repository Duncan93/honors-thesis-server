# honors-thesis-server -- Fingers Version

If I had considered the prospect of data collection, the entire site would have been Node.js from the beginning. :(

Document structure:

[{
	participant_id: int, # from URL
	fingers: boolean, # from URL
	participant_os: string, # navigator.userAgent (just part of)
	participant_browser: string, # http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser for name, and navigator.userAgent for version
	task_id: int, # from URL
	task_start_time: Date,
	task_end_time: Date, # ask users to press 'right arrow' or something to end task
	interactions: [ # these occur on particular interactions, not page load (like previous)
		{
			time: Date,
			key: int, // will be a keycode; postprocess this later
			userEvent: string,
			text: string
		},
		{
			...
		}
	]
}]

When I'm running non-Fingers version, collect all key data, (should rely on same code), and don't take text (set as "" or something). This will help me build an ordered list of keypresses taken

Todo:

Pause/unpause = escape
 - Note: The code will not collect data during pause
Next task = right arrow

* NOT NOW --> On success, change window location to the next task? Maybe not, because although that would mean I wouldn't need to lean in and change the URL every time, it wouldn't give me time to read participants directions... Hold off for now

