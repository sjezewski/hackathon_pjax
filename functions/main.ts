###### 
##  PJAX FUNCTIONS
######

@func XMLNode.pjaxify(Text %css_selector) {
  attribute("data-pjax", %css_selector)  
}


@func Text.pjax_html(Text %encoding) {
  match($x_pjax, /.+/) {
    $pjax = "true"    
  }

   html(%encoding) {  
     yield()
       match($pjax,"true") {     
          # Extract the title
          $title = "<title>" + fetch("//title/text()") + "</title>"

          # Extract the pjax content
          $$($x_pjax_container) {
            $content = inner()
          }
       }
     
   }
    match($pjax) {
      with("true") {
        match($debug_pjax,"true") {
          log("PJAX Title:" + $title + "\n\n")
          log("PJAX Content:" + $content + "\n\n")
        }
        set($title + "\r\n\r\n" + $content)
      }
    }
}


####################
### Bundled Functions
####################

# Remove Styles Functions
@func XMLNode.remove_external_styles() {
  remove(".//link[@rel='stylesheet']")
}
@func XMLNode.remove_internal_styles() {
  remove(".//style")
}
@func XMLNode.remove_all_styles() {
  remove(".//link[@rel='stylesheet']|.//style")
}

# Remove Scripts
@func XMLNode.remove_external_scripts() {
  remove(".//script[@src]")
}
@func XMLNode.remove_internal_scripts() {
  remove(".//script[not(@src)]")
}
@func XMLNode.remove_scripts() {
  remove(".//script")
}
@func XMLNode.remove_desktop_js() {
  remove("//script[@src and (not(@data-keep) or @data-keep='false')]")
}

# Remove HTML Comment Tags
@func XMLNode.remove_html_comments() {
  remove(".//comment()")
}

# Clean Meta Tags
@func XMLNode.insert_mobile_meta_tags() {
  # Remove only existing meta tags for which we will add our own
  remove(".//meta[@name='viewport']|.//meta[@name='format-detection']")

  # Add our meta tags
  $("/html/head") {
    insert("meta", http-equiv: "Content-Type", content: "text/html")
    insert("meta", name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0")
    insert("meta", name: "format-detection", content: "telephone=no")

    # Inject a canonical link as long as there isn't already one. 
    $canonical_found = "false"
    $(".//link[@rel='canonical']") {
      $canonical_found = "true"
    }
    match($canonical_found) {
      with(/false/) {
        insert("link", rel: "canonical", href: concat("http://", $source_host, $path))
      }
    }
  }
}

# Add in our Assets
@func XMLNode.add_assets() {
  $("./body") {
    insert_bottom("div", class: "myassets") {
      #insert("link", rel: "stylesheet", type: "text/css", href: sass($device_stylesheet))
      insert("link", rel: "shortcut icon", href: asset("images/favicon.ico"))
      # The images below are placeholders, get real ones from the client
      # Change to -precomposed to not have the glass effect on the icons
      insert("link", rel: "apple-touch-icon", href: asset("images/apple-touch-icon-57x57.png"))
      insert("link", rel: "apple-touch-icon", href: asset("images/apple-touch-icon-114x114.png"))
      insert_top("script", data-keep: "true", type: "text/javascript", src: asset("javascript/main.js"))
    }
  }
}

# Rewrite items
@func XMLNode.rewrite_links() {
  $rewriter_url = "false"
  $("./head") {
    # Add AJAX rewrite config to rewrite items via JS (need passthrough_ajax.js)
    insert_top("meta") {
      attribute("id", "mw_link_passthrough_config")
      attribute("rewrite_link_matcher", $rewrite_link_matcher)
      attribute("rewrite_link_replacement", $rewrite_link_replacement)
    }
  }
  $("./body") {
    # Rewrite links
    $(".//a") {
      attribute("href") {
        value() {
          rewrite("link")
        }
      }
    }
    $("/html/head/base[@href]") {
      $rewriter_url = fetch("./@href")
      $rewriter_url {
        replace(/.*(\/\/[\w\.]+\/).*/, "\\1")
      }
      attribute("href") {
        value() {
          rewrite("link")
        }
      }
    }
    # Rewrite form actions
    $(".//form") {
      attribute("action") {
        value() {
          rewrite("link")
        }
      }
    }
  }
}

# Absolutize Items 
@func XMLNode.absolutize_srcs() {
  # Absolutize IMG and SCRIPT SRCs
  var("slash_path") {
    # the 'slash_path' is the path of this page without anything following it's last slash
    set($path)
    replace(/[^\/]+$/, "")
    # turn empty string into a single slash because this is the only thing separating the host from the path relative path
    replace(/^$/, "/")
  }
  # Find images and scripts that link to an external host
  $(".//img|.//script[@src]") {
    # GOTCHAS :: Watch out for captcha images, they most likely should
    # not be absolutized
    $src = fetch("./@src")
    match($rewriter_url) {
      not(/false/) {
        # Do nothing :: Use base tag value
      }
      else() {
        $rewriter_url = $source_host
      }
    }
    # skip URLs which: are empty, have a host (//www.example.com), or have a protocol (http:// or mailto:)
    match($src, /^(?![a-z]+\:)(?!\/\/)(?!$)/) {
      attribute("src") {
        value() {
          match($src) {
            with(/^\//) {
              # host-relative URL: just add the host
              prepend(concat("//", $rewriter_url))
            }
            else() {
              # path-relative URL: add the host and the path
              prepend(concat("//", $rewriter_url, $slash_path))
            }
          }
        }
      }
    }
  }
}

@func XMLNode.relocate_scripts() {
  $("/html/body/script") {
    move_to("/html/body", "bottom")
  }
}

# This function lateloads all images and moves scripts to the bottom of the body, place function at end of html.ts
@func XMLNode.lateload() {
  $(".//script") {
    move_to("//html/body")
  }
  $(".//img") {
    attribute("src") {
      name("data-ur-ll-src")
    }
  }
}
