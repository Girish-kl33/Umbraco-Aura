param([Parameter(Mandatory = $true)][string]$Path)

Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile($Path)

# Regions of interest from the reported screenshot, as name + bounding box.
# Each region reports its brightest pixel, which is the glyph colour for text on a dark theme.
$regions = @(
  @{ n = 'page background';        x = 400; y = 420; w = 40;  h = 20 },
  @{ n = 'top nav "Media"';        x = 22;  y = 8;   w = 30;  h = 16 },
  @{ n = 'active tab "Settings"';  x = 62;  y = 8;   w = 40;  h = 16 },
  @{ n = 'tab underline';          x = 62;  y = 28;  w = 40;  h = 5  },
  @{ n = 'sidebar selected item';  x = 5;   y = 116; w = 80;  h = 16 },
  @{ n = '"Add tab" link';         x = 124; y = 80;  w = 45;  h = 14 },
  @{ n = '"Add property" link';    x = 530; y = 130; w = 60;  h = 14 },
  @{ n = 'group heading "Article"'; x = 128; y = 183; w = 40; h = 14 },
  @{ n = 'property label "Article"'; x = 126; y = 220; w = 40; h = 14 },
  @{ n = 'alias "umbracoFile"';    x = 248; y = 220; w = 60;  h = 14 },
  @{ n = 'placeholder "Enter a description"'; x = 126; y = 242; w = 100; h = 14 },
  @{ n = 'editor label "Upload Article"'; x = 325; y = 220; w = 60; h = 14 },
  @{ n = '"* Mandatory"';          x = 325; y = 256; w = 55;  h = 14 },
  @{ n = '"Label (string)"';       x = 322; y = 304; w = 55;  h = 14 },
  @{ n = 'panel label "Name"';     x = 768; y = 62;  w = 30;  h = 14 },
  @{ n = 'focused input border';   x = 770; y = 80;  w = 160; h = 4  },
  @{ n = 'input text "Article"';   x = 772; y = 84;  w = 40;  h = 14 },
  @{ n = 'alias pill "umbracoFile"'; x = 940; y = 82; w = 60; h = 14 },
  @{ n = 'unfocused input border'; x = 770; y = 126; w = 160; h = 4  },
  @{ n = '"Property Editor" label'; x = 768; y = 168; w = 70; h = 14 },
  @{ n = 'editor name "Upload Article"'; x = 788; y = 190; w = 60; h = 12 },
  @{ n = 'editor alias line';      x = 788; y = 200; w = 100; h = 10 },
  @{ n = 'mandatory toggle on';    x = 770; y = 282; w = 20;  h = 12 },
  @{ n = 'placeholder "Value cannot be empty"'; x = 772; y = 326; w = 100; h = 14 },
  @{ n = 'select "No validation"';  x = 772; y = 373; w = 70;  h = 14 },
  @{ n = '"Close" button';         x = 934; y = 502; w = 30;  h = 14 },
  @{ n = '"Submit" button fill';   x = 972; y = 500; w = 44;  h = 18 },
  @{ n = 'breadcrumb "Media Types"'; x = 112; y = 502; w = 60; h = 14 }
)

function Lum([int]$r, [int]$g, [int]$b) {
  $f = {
    param($c)
    $s = $c / 255.0
    if ($s -le 0.04045) { return $s / 12.92 }
    return [Math]::Pow((($s + 0.055) / 1.055), 2.4)
  }
  return 0.2126 * (& $f $r) + 0.7152 * (& $f $g) + 0.0722 * (& $f $b)
}

$bgLum = 0.0  # pure black page background

"{0,-42} {1,-9} {2,-9} {3}" -f 'region', 'brightest', 'ratio', 'verdict'
'-' * 78

foreach ($reg in $regions) {
  $best = $null; $bestLum = -1
  for ($y = $reg.y; $y -lt ($reg.y + $reg.h); $y++) {
    for ($x = $reg.x; $x -lt ($reg.x + $reg.w); $x++) {
      if ($x -ge $bmp.Width -or $y -ge $bmp.Height) { continue }
      $p = $bmp.GetPixel($x, $y)
      # Ignore the red annotation the user drew over the screenshot.
      if ($p.R -gt 140 -and $p.G -lt 70 -and $p.B -lt 70) { continue }
      $l = Lum $p.R $p.G $p.B
      if ($l -gt $bestLum) { $bestLum = $l; $best = $p }
    }
  }
  if ($null -eq $best) { continue }
  $hex = '#{0:x2}{1:x2}{2:x2}' -f $best.R, $best.G, $best.B
  $ratio = ($bestLum + 0.05) / ($bgLum + 0.05)
  $verdict = if ($ratio -ge 7) { 'ok (7:1)' } elseif ($ratio -ge 4.5) { 'below HC target' } else { 'FAILS 4.5:1' }
  "{0,-42} {1,-9} {2,-9} {3}" -f $reg.n, $hex, ("{0:N2}:1" -f $ratio), $verdict
}

$bmp.Dispose()
