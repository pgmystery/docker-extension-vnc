import gulp from "gulp"
import markdown from "gulp-markdown"
import rename from "gulp-rename"
import { marked } from 'marked'


export function convertReadmeToHTML() {
  function postProcess(html: string): string {
    return html.replace(/(\r\n|\n|\r)/gm, '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  const githubUrl = 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/'
  const renderer = new marked.Renderer()

  // @ts-ignore
  renderer.image = (src: string, _: null, title: string): string =>
    `<p><a href="${githubUrl + src}">${title} Screenshot</a></p>`

  gulp.src("../README.md")
      .pipe(markdown({ renderer, hooks: { postprocess: postProcess } }))
      .pipe(rename("docker_extension_detailed_description.html"))
      .pipe(gulp.dest('../docs/'))
}
