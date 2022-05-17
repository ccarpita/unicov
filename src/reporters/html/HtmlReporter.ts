import fs from 'fs';
import { CommonCoverage, CoverageReporterType, ParseOptions, Reporter } from '../../common/interface';

import { frontend } from './frontend';

export class HtmlReporter implements Reporter {
    type(): CoverageReporterType {
        return "html";
    }

    extension(): string {
        return "html";
    }

    async parse(content: string, options?: ParseOptions): Promise<CommonCoverage> {
        const match = content.match(/<meta name="unicov-coverage" content="([^"]+)/)
        if (match && match[1]) {
            const json = Buffer.from(match[1], "base64")
            return JSON.parse(json.toString("utf-8"));
        }
        return {files: []};
    }

    check(content: string): boolean {
        return content.indexOf("<!DOCTYPE html>") != -1 && content.indexOf("<meta name=\"unicov-coverage\"") !== 0
    }

    format(data: CommonCoverage): string {
        const coverageData = Buffer.from(JSON.stringify(data)).toString("base64");
        const metas = data.files.map(file => {
            const paths = [file.path];
            if (data.projectRoot) {
                paths.unshift(file.path.replace(data.projectRoot, ""))
            }
            const validPath = paths.filter(path => fs.existsSync(path))[0]
            if (validPath) {
                const content = fs.readFileSync(validPath, {encoding: "utf-8"})
                const contentB64 = Buffer.from(content).toString("base64")
                return `<meta name="unicov-src-${validPath}" content=\"${contentB64}\" />`
            }
            return ""
        }).filter(meta => meta)
        return `
<!DOCTYPE html>
<html>
<head><title>Unicov HTML Report</title>
<meta name="unicov-coverage" content="${coverageData}" />
${metas.join('\n')}
</head>
<body>Loading...
<script type="text/javascript">${frontend.toString()}; frontend()</script>
</body>
</html>
`;
    }
}
