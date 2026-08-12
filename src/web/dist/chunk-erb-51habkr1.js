import {
  ruby_default
} from "./chunk-main-1yz36463.js";
import"./chunk-main-9y79csmq.js";
import"./chunk-main-e6hyxvad.js";
import"./chunk-main-er1rzytv.js";
import"./chunk-main-7zbtp9tr.js";
import"./chunk-main-masvk3p7.js";
import"./chunk-main-nwmc2s7m.js";
import"./chunk-main-1pjenedz.js";
import"./chunk-main-9bjdr4eq.js";
import"./chunk-main-js983aw7.js";
import"./chunk-main-28jkeb3k.js";
import"./chunk-main-9c546y7e.js";
import"./chunk-main-kamx0cy6.js";
import"./chunk-main-y5kdbprc.js";
import"./chunk-main-js26g8fq.js";
import"./chunk-main-skp2mbfw.js";
import {
  html_default
} from "./chunk-main-jbdhzabc.js";
import"./chunk-main-5e77nggf.js";
import"./chunk-main-963n6y8z.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/@shikijs/langs/dist/erb.mjs
var lang = Object.freeze(JSON.parse('{"displayName":"ERB","fileTypes":["erb","rhtml","html.erb"],"injections":{"text.html.erb - (meta.embedded.block.erb | meta.embedded.line.erb | comment)":{"patterns":[{"begin":"^(\\\\s*)(?=<%+#(?![^%]*%>))","beginCaptures":{"0":{"name":"punctuation.whitespace.comment.leading.erb"}},"end":"(?!\\\\G)(\\\\s*$\\\\n)?","endCaptures":{"0":{"name":"punctuation.whitespace.comment.trailing.erb"}},"patterns":[{"include":"#comment"}]},{"begin":"^(\\\\s*)(?=<%(?![^%]*%>))","beginCaptures":{"0":{"name":"punctuation.whitespace.embedded.leading.erb"}},"end":"(?!\\\\G)(\\\\s*$\\\\n)?","endCaptures":{"0":{"name":"punctuation.whitespace.embedded.trailing.erb"}},"patterns":[{"include":"#tags"}]},{"include":"#comment"},{"include":"#tags"}]}},"name":"erb","patterns":[{"include":"text.html.basic"}],"repository":{"comment":{"patterns":[{"begin":"<%+#","beginCaptures":{"0":{"name":"punctuation.definition.comment.begin.erb"}},"end":"%>","endCaptures":{"0":{"name":"punctuation.definition.comment.end.erb"}},"name":"comment.block.erb"}]},"tags":{"patterns":[{"begin":"<%+(?!>)[-=]?(?![^%]*%>)","beginCaptures":{"0":{"name":"punctuation.section.embedded.begin.erb"}},"contentName":"source.ruby","end":"(-?%)>","endCaptures":{"0":{"name":"punctuation.section.embedded.end.erb"},"1":{"name":"source.ruby"}},"name":"meta.embedded.block.erb","patterns":[{"captures":{"1":{"name":"punctuation.definition.comment.erb"}},"match":"(#).*?(?=-?%>)","name":"comment.line.number-sign.erb"},{"include":"source.ruby"}]},{"begin":"<%+(?!>)[-=]?","beginCaptures":{"0":{"name":"punctuation.section.embedded.begin.erb"}},"contentName":"source.ruby","end":"(-?%)>","endCaptures":{"0":{"name":"punctuation.section.embedded.end.erb"},"1":{"name":"source.ruby"}},"name":"meta.embedded.line.erb","patterns":[{"captures":{"1":{"name":"punctuation.definition.comment.erb"}},"match":"(#).*?(?=-?%>)","name":"comment.line.number-sign.erb"},{"include":"source.ruby"}]}]}},"scopeName":"text.html.erb","embeddedLangs":["html","ruby"]}'));
var erb_default = [
  ...html_default,
  ...ruby_default,
  lang
];
export {
  erb_default as default
};

//# debugId=7101C3CF1CC9D04A64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzaGlraWpzL2xhbmdzL2Rpc3QvZXJiLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQgaHRtbCBmcm9tICcuL2h0bWwubWpzJ1xuaW1wb3J0IHJ1YnkgZnJvbSAnLi9ydWJ5Lm1qcydcblxuY29uc3QgbGFuZyA9IE9iamVjdC5mcmVlemUoSlNPTi5wYXJzZShcIntcXFwiZGlzcGxheU5hbWVcXFwiOlxcXCJFUkJcXFwiLFxcXCJmaWxlVHlwZXNcXFwiOltcXFwiZXJiXFxcIixcXFwicmh0bWxcXFwiLFxcXCJodG1sLmVyYlxcXCJdLFxcXCJpbmplY3Rpb25zXFxcIjp7XFxcInRleHQuaHRtbC5lcmIgLSAobWV0YS5lbWJlZGRlZC5ibG9jay5lcmIgfCBtZXRhLmVtYmVkZGVkLmxpbmUuZXJiIHwgY29tbWVudClcXFwiOntcXFwicGF0dGVybnNcXFwiOlt7XFxcImJlZ2luXFxcIjpcXFwiXihcXFxcXFxcXHMqKSg/PTwlKyMoPyFbXiVdKiU+KSlcXFwiLFxcXCJiZWdpbkNhcHR1cmVzXFxcIjp7XFxcIjBcXFwiOntcXFwibmFtZVxcXCI6XFxcInB1bmN0dWF0aW9uLndoaXRlc3BhY2UuY29tbWVudC5sZWFkaW5nLmVyYlxcXCJ9fSxcXFwiZW5kXFxcIjpcXFwiKD8hXFxcXFxcXFxHKShcXFxcXFxcXHMqJFxcXFxcXFxcbik/XFxcIixcXFwiZW5kQ2FwdHVyZXNcXFwiOntcXFwiMFxcXCI6e1xcXCJuYW1lXFxcIjpcXFwicHVuY3R1YXRpb24ud2hpdGVzcGFjZS5jb21tZW50LnRyYWlsaW5nLmVyYlxcXCJ9fSxcXFwicGF0dGVybnNcXFwiOlt7XFxcImluY2x1ZGVcXFwiOlxcXCIjY29tbWVudFxcXCJ9XX0se1xcXCJiZWdpblxcXCI6XFxcIl4oXFxcXFxcXFxzKikoPz08JSg/IVteJV0qJT4pKVxcXCIsXFxcImJlZ2luQ2FwdHVyZXNcXFwiOntcXFwiMFxcXCI6e1xcXCJuYW1lXFxcIjpcXFwicHVuY3R1YXRpb24ud2hpdGVzcGFjZS5lbWJlZGRlZC5sZWFkaW5nLmVyYlxcXCJ9fSxcXFwiZW5kXFxcIjpcXFwiKD8hXFxcXFxcXFxHKShcXFxcXFxcXHMqJFxcXFxcXFxcbik/XFxcIixcXFwiZW5kQ2FwdHVyZXNcXFwiOntcXFwiMFxcXCI6e1xcXCJuYW1lXFxcIjpcXFwicHVuY3R1YXRpb24ud2hpdGVzcGFjZS5lbWJlZGRlZC50cmFpbGluZy5lcmJcXFwifX0sXFxcInBhdHRlcm5zXFxcIjpbe1xcXCJpbmNsdWRlXFxcIjpcXFwiI3RhZ3NcXFwifV19LHtcXFwiaW5jbHVkZVxcXCI6XFxcIiNjb21tZW50XFxcIn0se1xcXCJpbmNsdWRlXFxcIjpcXFwiI3RhZ3NcXFwifV19fSxcXFwibmFtZVxcXCI6XFxcImVyYlxcXCIsXFxcInBhdHRlcm5zXFxcIjpbe1xcXCJpbmNsdWRlXFxcIjpcXFwidGV4dC5odG1sLmJhc2ljXFxcIn1dLFxcXCJyZXBvc2l0b3J5XFxcIjp7XFxcImNvbW1lbnRcXFwiOntcXFwicGF0dGVybnNcXFwiOlt7XFxcImJlZ2luXFxcIjpcXFwiPCUrI1xcXCIsXFxcImJlZ2luQ2FwdHVyZXNcXFwiOntcXFwiMFxcXCI6e1xcXCJuYW1lXFxcIjpcXFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJlZ2luLmVyYlxcXCJ9fSxcXFwiZW5kXFxcIjpcXFwiJT5cXFwiLFxcXCJlbmRDYXB0dXJlc1xcXCI6e1xcXCIwXFxcIjp7XFxcIm5hbWVcXFwiOlxcXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuZW5kLmVyYlxcXCJ9fSxcXFwibmFtZVxcXCI6XFxcImNvbW1lbnQuYmxvY2suZXJiXFxcIn1dfSxcXFwidGFnc1xcXCI6e1xcXCJwYXR0ZXJuc1xcXCI6W3tcXFwiYmVnaW5cXFwiOlxcXCI8JSsoPyE+KVstPV0/KD8hW14lXSolPilcXFwiLFxcXCJiZWdpbkNhcHR1cmVzXFxcIjp7XFxcIjBcXFwiOntcXFwibmFtZVxcXCI6XFxcInB1bmN0dWF0aW9uLnNlY3Rpb24uZW1iZWRkZWQuYmVnaW4uZXJiXFxcIn19LFxcXCJjb250ZW50TmFtZVxcXCI6XFxcInNvdXJjZS5ydWJ5XFxcIixcXFwiZW5kXFxcIjpcXFwiKC0/JSk+XFxcIixcXFwiZW5kQ2FwdHVyZXNcXFwiOntcXFwiMFxcXCI6e1xcXCJuYW1lXFxcIjpcXFwicHVuY3R1YXRpb24uc2VjdGlvbi5lbWJlZGRlZC5lbmQuZXJiXFxcIn0sXFxcIjFcXFwiOntcXFwibmFtZVxcXCI6XFxcInNvdXJjZS5ydWJ5XFxcIn19LFxcXCJuYW1lXFxcIjpcXFwibWV0YS5lbWJlZGRlZC5ibG9jay5lcmJcXFwiLFxcXCJwYXR0ZXJuc1xcXCI6W3tcXFwiY2FwdHVyZXNcXFwiOntcXFwiMVxcXCI6e1xcXCJuYW1lXFxcIjpcXFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmVyYlxcXCJ9fSxcXFwibWF0Y2hcXFwiOlxcXCIoIykuKj8oPz0tPyU+KVxcXCIsXFxcIm5hbWVcXFwiOlxcXCJjb21tZW50LmxpbmUubnVtYmVyLXNpZ24uZXJiXFxcIn0se1xcXCJpbmNsdWRlXFxcIjpcXFwic291cmNlLnJ1YnlcXFwifV19LHtcXFwiYmVnaW5cXFwiOlxcXCI8JSsoPyE+KVstPV0/XFxcIixcXFwiYmVnaW5DYXB0dXJlc1xcXCI6e1xcXCIwXFxcIjp7XFxcIm5hbWVcXFwiOlxcXCJwdW5jdHVhdGlvbi5zZWN0aW9uLmVtYmVkZGVkLmJlZ2luLmVyYlxcXCJ9fSxcXFwiY29udGVudE5hbWVcXFwiOlxcXCJzb3VyY2UucnVieVxcXCIsXFxcImVuZFxcXCI6XFxcIigtPyUpPlxcXCIsXFxcImVuZENhcHR1cmVzXFxcIjp7XFxcIjBcXFwiOntcXFwibmFtZVxcXCI6XFxcInB1bmN0dWF0aW9uLnNlY3Rpb24uZW1iZWRkZWQuZW5kLmVyYlxcXCJ9LFxcXCIxXFxcIjp7XFxcIm5hbWVcXFwiOlxcXCJzb3VyY2UucnVieVxcXCJ9fSxcXFwibmFtZVxcXCI6XFxcIm1ldGEuZW1iZWRkZWQubGluZS5lcmJcXFwiLFxcXCJwYXR0ZXJuc1xcXCI6W3tcXFwiY2FwdHVyZXNcXFwiOntcXFwiMVxcXCI6e1xcXCJuYW1lXFxcIjpcXFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmVyYlxcXCJ9fSxcXFwibWF0Y2hcXFwiOlxcXCIoIykuKj8oPz0tPyU+KVxcXCIsXFxcIm5hbWVcXFwiOlxcXCJjb21tZW50LmxpbmUubnVtYmVyLXNpZ24uZXJiXFxcIn0se1xcXCJpbmNsdWRlXFxcIjpcXFwic291cmNlLnJ1YnlcXFwifV19XX19LFxcXCJzY29wZU5hbWVcXFwiOlxcXCJ0ZXh0Lmh0bWwuZXJiXFxcIixcXFwiZW1iZWRkZWRMYW5nc1xcXCI6W1xcXCJodG1sXFxcIixcXFwicnVieVxcXCJdfVwiKSlcblxuZXhwb3J0IGRlZmF1bHQgW1xuLi4uaHRtbCxcbi4uLnJ1YnksXG5sYW5nXG5dXG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQU0sT0FBTyxPQUFPLE9BQU8sS0FBSyxNQUFNLHc4REFBZ3RFLENBQUM7QUFFdnZFLElBQWU7QUFBQSxFQUNmLEdBQUc7QUFBQSxFQUNILEdBQUc7QUFBQSxFQUNIO0FBQ0E7IiwKICAiZGVidWdJZCI6ICI3MTAxQzNDRjFDQzlEMDRBNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
