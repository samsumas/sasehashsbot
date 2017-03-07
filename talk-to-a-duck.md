---
layout: default
---

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script type="text/javascript" src="cyberduck/termlib.js"></script>
<script type="text/javascript" src="cyberduck/cyberduckbot.js"></script>
<script type="text/javascript" src="cyberduck/cyberduckdata.js"></script>
<script type="text/javascript" src="cyberduck/cyberduck.js"></script>
<link rel="stylesheet" type="text/css" href="cyberduck/cyberduck.css" />

<center>
	<img src="https://raw.githubusercontent.com/RubberDuckDebugging/rubberduckdebugging.github.io/master/images/rubberducky.png" alt="Cyberduck" />
	<table border="0" cellspacing="10" cellpadding="0" width="100%">
	</td></tr>
	<tr><td align="center">
		<a style="display:none;" href="#" class="termopen" id="termOpenLink">Open CYBERDUCK terminal&nbsp;</A>
	</td></tr>
	<tr><td align="center" valign="top" height="370">
		<div id="cyberduckDiv" style="position:relative;"></div>
	</td></tr>
	</table>
</center>

<script>
  $(document).ready(function() {
    termOpen();
  });
</script>