document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("extract-button").addEventListener("click", async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            const textNodes = document.querySelectorAll(":not(iframe):not(script):not(style)");
            const textArray = Array.from(textNodes).map(node => node.textContent.trim());
            return textArray.filter(text => text.length > 0);
          },
        });
        const extractedText = results[0].result.join("\n").slice(8);
        // console.log(extractedText)
        // pred_score_1 = 6.32004967e+00*awl(extractedText) - 4.70656069e-02*asl(extractedText) + 3.30719853e-04*polysll_cnt1(extractedText) - 7
        pred_score_2 = (15.0315825*awl(extractedText) + 0.75246748*asl(extractedText) + 25.89533089*polysll_cnt(extractedText))/60 
        // console.log(pred_score);
        var outStr = `<span style="color:blue">Readibility Score</span> <br>${pred_score_2}`
        document.getElementById("extracted-text").innerHTML = outStr;

      } catch (error) {
        alert(error);
      }
    });
  });
  

  function asl(inp) {
    var sentence_cnt, word_cnt, words;
    inp = inp.split("\u0964");
    sentence_cnt = inp.length;
    word_cnt = 0;
  
    for (var sentence, _pj_c = 0, _pj_a = inp, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
      sentence = _pj_a[_pj_c];
      words = sentence.trim().split(" ");
      word_cnt += words.length;
    }
  
    return word_cnt / sentence_cnt;
  }
  
  function awl(inp) {
    var word_len, words, words_f;
    words = inp.split(" ");
    words_f = words.length;
    word_len = 0;
  
    for (var word, _pj_c = 0, _pj_a = words, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
      word = _pj_a[_pj_c];
  
      for (var _, _pj_f = 0, _pj_d = word, _pj_e = _pj_d.length; _pj_f < _pj_e; _pj_f += 1) {
        _ = _pj_d[_pj_f];
  
        if (_.charCodeAt(0) >= "\u0905".charCodeAt(0) && _.charCodeAt(0) <= "\u0939".charCodeAt(0)) {
          word_len += 1;
        }
      }
    }
  
    return word_len / words_f;
  }
  
  function polysll_cnt(inp) {
    var matra_cnt, polysyll, words, n_words;
    words = inp.split(" ");
    n_words = words.length;
    polysyll = 0;
  
    for (var word, _pj_c = 0, _pj_a = words, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
      word = _pj_a[_pj_c];
      matra_cnt = 0;
  
      for (var ind = 0, _pj_d = word.length; ind < _pj_d; ind += 1) {
        if (word[ind].charCodeAt(0) >= "\u0905".charCodeAt(0) && word[ind].charCodeAt(0) <= "\u0914".charCodeAt(0)) {
          matra_cnt += 2;
  
          if (word[ind] === "\u0905" || word[ind] === "\u0907" || word[ind] === "\u0909" || word[ind] === "\u090b") {
            matra_cnt -= 1;
          }
        }
  
        if (word[ind].charCodeAt(0) >= "\u093e".charCodeAt(0) && word[ind].charCodeAt(0) <= "\u094c".charCodeAt(0)) {
          matra_cnt += 1;
  
          if (word[ind].charCodeAt(0) === "\u093f".charCodeAt(0) || word[ind].charCodeAt(0) === "\u0941".charCodeAt(0) || word[ind] === "\u0943" || word[ind] === "\u0901") {
            matra_cnt -= 1;
          }
        } else {
          if (word[ind].charCodeAt(0) >= "\u0915".charCodeAt(0) && word[ind].charCodeAt(0) <= "\u0939".charCodeAt(0)) {
            matra_cnt += 1;
          } else {
            if (word[ind] === "\u094d") {
              if (ind >= 2) {
                matra_cnt += 1;
  
                if (word[ind-2].charCodeAt(0) >= "\u0915".charCodeAt(0) && word[ind-2].charCodeAt(0) <= "\u0939".charCodeAt(0)) {
                  matra_cnt -= 1;
                } else {
                  if (word[ind - 2] === "\u093f" || word[ind - 2] === "\u0941" || word[ind - 2] === "\u0943" || word[ind - 2] === "\u0901") {
                    matra_cnt -= 1;
                  } else {
                    if (word[ind-2].charCodeAt(0) >= "\u093e".charCodeAt(0) && word[ind-2].charCodeAt(0) <= "\u094c".charCodeAt(0)) {
                      matra_cnt -= 2;
                    } else {
                      if (word[ind - 2] === "\u0905" || word[ind - 2] === "\u0907" || word[ind - 2] === "\u0909" || word[ind - 2] === "\u090b") {
                        matra_cnt -= 1;
                      } else {
                        if (word[ind-2].charCodeAt(0) >= "\u0906".charCodeAt(0) && word[ind-2].charCodeAt(0) <= "\u0914".charCodeAt(0)) {
                          matra_cnt -= 2;
                        }
                      }
                    }
                  }
                }
              } else {
                matra_cnt -= 1;
              }
            }
          }
        }
      }
  
      if (matra_cnt > 2) {
        polysyll += 1;
      }
    }
  
    return polysyll/n_words;
  }
  
  // function polysll_cnt1(inp) {
  //   var matra_cnt, polysyll, words;
  //   words = inp.split(" ");
  //   polysyll = 0;
  
  //   for (var word, _pj_c = 0, _pj_a = words, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
  //     word = _pj_a[_pj_c];
  //     matra_cnt = 0;
  
  //     for (var ind = 0, _pj_d = word.length; ind < _pj_d; ind += 1) {
  //       if (word[ind].charCodeAt(0) >= "\u0905".charCodeAt(0) && word[ind].charCodeAt(0) <= "\u0914".charCodeAt(0)) {
  //         matra_cnt += 2;
  
  //         if (word[ind] === "\u0905" || word[ind] === "\u0907" || word[ind] === "\u0909" || word[ind] === "\u090b") {
  //           matra_cnt -= 1;
  //         }
  //       }
  
  //       if (word[ind].charCodeAt(0) >= "\u093e".charCodeAt(0) && word[ind].charCodeAt(0) <= "\u094c".charCodeAt(0)) {
  //         matra_cnt += 1;
  
  //         if (word[ind].charCodeAt(0) === "\u093f".charCodeAt(0) || word[ind].charCodeAt(0) === "\u0941".charCodeAt(0) || word[ind] === "\u0943" || word[ind] === "\u0901") {
  //           matra_cnt -= 1;
  //         }
  //       } else {
  //         if (word[ind].charCodeAt(0) >= "\u0915".charCodeAt(0) && word[ind].charCodeAt(0) <= "\u0939".charCodeAt(0)) {
  //           matra_cnt += 1;
  //         } else {
  //           if (word[ind] === "\u094d") {
  //             if (ind >= 2) {
  //               matra_cnt += 1;
  
  //               if (word[ind-2].charCodeAt(0) >= "\u0915".charCodeAt(0) && word[ind-2].charCodeAt(0) <= "\u0939".charCodeAt(0)) {
  //                 matra_cnt -= 1;
  //               } else {
  //                 if (word[ind - 2] === "\u093f" || word[ind - 2] === "\u0941" || word[ind - 2] === "\u0943" || word[ind - 2] === "\u0901") {
  //                   matra_cnt -= 1;
  //                 } else {
  //                   if (word[ind-2].charCodeAt(0) >= "\u093e".charCodeAt(0) && word[ind-2].charCodeAt(0) <= "\u094c".charCodeAt(0)) {
  //                     matra_cnt -= 2;
  //                   } else {
  //                     if (word[ind - 2] === "\u0905" || word[ind - 2] === "\u0907" || word[ind - 2] === "\u0909" || word[ind - 2] === "\u090b") {
  //                       matra_cnt -= 1;
  //                     } else {
  //                       if (word[ind-2].charCodeAt(0) >= "\u0906".charCodeAt(0) && word[ind-2].charCodeAt(0) <= "\u0914".charCodeAt(0)) {
  //                         matra_cnt -= 2;
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             } else {
  //               matra_cnt -= 1;
  //             }
  //           }
  //         }
  //       }
  //     }
  
  //     if (matra_cnt > 2) {
  //       polysyll += 1;
  //     }
  //   }
  
  //   return polysyll;
  // }