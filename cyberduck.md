---
layout: default
---

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script type="text/javascript" src="../cyberduck/termlib.js"></script>
<script type="text/javascript" src="../cyberduck/cyberduckbot.js"></script>
<script type="text/javascript" src="../cyberduck/cyberduckdata.js"></script>
<script type="text/javascript" src="../cyberduck/cyberduck.js"></script>
<link rel="stylesheet" type="text/css" href="../cyberduck/cyberduck.css" />

# Talk with a Duck

<center>
	<table border="0" cellspacing="10" cellpadding="0" width="100%">
		<tr>
			<td align="center">
				<a style="display:none;" href="#" class="termopen" id="termOpenLink">Open CYBERDUCK terminal&nbsp;</a>
			</td>
		</tr>
		<tr>
			<td align="center" valign="top" height="370">
				<div id="cyberduckDiv" style="position:relative;"></div>
			</td>
		</tr>
	</table>
</center>

<script>
  $(document).ready(function() {
    termOpen();
  });
</script>

## References
Cyberduck is based on work by Joseph Weizenbaum and Norbert Landsteiner.

- Weizenbaum, Joseph. **ELIZA – A Computer Program For the Study of Natural Language Communication Between Man and Machine.** *Communications of the ACM*, Volume 9, Issue 1, pages 36-45, January 1966.<br/>
- Elizabot: [http://www.masswerk.at/elizabot](http://www.masswerk.at/elizabot/)
