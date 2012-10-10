# PJAX

PJAX stands for page-state + ajax. It allows pages to be loaded via ajax, but supports proper links / events / reloads etc. It also degrades gracefully if the content cannot be loaded.

## How

Pretty easy. You need to do three things.

### 1. Setup your project

You'll need:

- The pjax js
  - both the jquery plugin
  - and mjax.js
- My pjax functions: `pjaxify` and `pjax_html`

### 2. Specify which links will use pjax

    $("//a[@class='mylinks']") {
      pjaxify("#main")
    }

What did we do here? 

- We selected the links we want to load via pjax
- We added an attribute to these links
  - This attribute is a css selector for the content you want pjax to suck out of the anchor's href
- The pjax JS sends along this selector in its request, which makes it easy for the server to respond w the proper content

If you wanted certain links to pjax different content, easy! This is specified w a different argument to `pjaxify`

### 3. Use pjax_html() to open your html scope

    pjax_html() {
      # Normal tritium here
      # ...
    }

This responds to the headers that pjax sends via ajax (`x-pjax` and `x-pjax-container`). It extracts the title and content from the html and resets the response to be exactly what the pjax javascript expects.


## Examples

- Open your inspector
- Look at the network tab
- Hit the 'XHR' filter so you only see ajax requests
- Hit the 'record' button so you see requests across page loads
- [Go to this page](http://sean.moovweb.com.moovapp.com/platform/vision)
  - If you click around you can see which links are enabled w pjax
    - (The ones that load via XHR)
  - And those links that are normal links 


---


# Project Info

## Basics
This project works with the MoovSDK.

See detailed documentation for the MoovSDK at http://beta.moovweb.com

## Domains
Remember to put all domains you're going to hit in your etc/hosts
or to run your server with the `-auto-hosts=true` option.

    127.0.0.1 	mlocal.moovweb.com
    127.0.0.1 	mlocal.beta.moovweb.com
