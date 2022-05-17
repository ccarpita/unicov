import { CommonCoverage } from '../../common/interface'

type Attrs = {[k: string]: string}

export function frontend() {
  function $c(tagName: string, attrs?: Attrs) {
    const el = document.createElement(tagName);
    Object.keys(attrs || {}).forEach(key => {
      el.setAttribute(key, (attrs || {})[key]);
    });
    return el;
  }

  class Tree {
    public readonly root: HTMLElement;
    public readonly parent: Tree | null;

    constructor(rootTag: string, rootAttrs?: Attrs, parent?: Tree) {
      this.root = $c(rootTag, rootAttrs);
      this.parent = parent || null;
    }

    child(tag: string, attrs?: Attrs): Tree {
      const sub = new Tree(tag, attrs, this);
      this.root.appendChild(sub.root);
      return sub;
    }

    mount(parent: HTMLElement): this {
      parent.appendChild(this.root);
      return this;
    }

    text(content: any): this {
      this.root.textContent = String(content);
      return this;
    }
  }


  class Application {
    mount(parent: HTMLElement) {
      const statsElement = document.querySelector("meta[name='unicov-coverage']")
      console.log(statsElement);
      const coverageData = JSON.parse(window.atob(statsElement?.getAttribute("content") || "{}"))
      console.log(coverageData);
      const div = new Tree("div", {class: 'application'});
      const table = div.child("table");
      const lineStats = (coverageData as CommonCoverage).files.map(file => {
        const hitmiss: number[] = file.lines.map(line => line.hits > 0 ? 1 : 0)
        const covered = hitmiss.reduce((acc, n) => acc + n, 0);
        const total = file.lines.length;
        return { covered, total };
      }).reduce((acc, next) => {
        if (!acc) {
          return next;
        }
        return {
          covered: acc.covered + next.covered,
          total: acc.total + next.total
        }
      });
      const heading = table.child("tr");
      heading.child("th").text("Covered Lines")
      heading.child("th").text("Total Lines")
      heading.child("th").text("% Covered")
      const data = table.child("tr")
      data.child("td").text(lineStats.covered);
      data.child("td").text(lineStats.total);
      data.child("td").text(lineStats.total ? (100.0 * lineStats.covered) / lineStats.total : 0);

      parent.innerHTML = "";
      div.mount(parent);
    }
  }
  new Application().mount(document.body)
}