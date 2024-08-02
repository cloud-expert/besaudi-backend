const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const sharp = require('sharp');
const request = require('request').defaults({ encoding: null });

const targetImages = {
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-adult-1.png?alt=media&token=d0c79ff9-6c44-4ab9-879a-3a1e36857ca8": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-adult-2.png?alt=media&token=f4958814-bf52-46ef-8f58-fb01a51ced9f": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-adult-3.png?alt=media&token=89dffd7d-cd31-47c2-ae06-ba49da574975": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-adult-4.png?alt=media&token=94f1684a-e452-4c41-9b02-0bb80e53a8af": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-adult-5.png?alt=media&token=34e8b4aa-a7cd-41d5-ad7e-4d0a8a976fd6": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-kid-1.png?alt=media&token=ef4d665c-0f57-4795-8e92-7c7b62586294": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-kid-2.png?alt=media&token=49150755-de44-4c98-8639-2c55a6c7496d": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-kid-3.png?alt=media&token=bbe3f3b4-e1a1-4a61-a5c8-07035f678658": "",
  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Fmale-kid-4.png?alt=media&token=8c5c7b0e-c637-4b6d-a1bb-2836d3c7a2ab": "",

  "https://firebasestorage.googleapis.com/v0/b/test-1r2ng0.appspot.com/o/template%2Ffemale-adult-1.png?alt=media&token=85677c50-aa21-457f-8c1b-11e73deeb0c7": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
}

const generateImage = catchAsync(async (req, res) => {
  console.log('>>> Generate Image \n');
  const response = await fetch(`https://api.runpod.ai/v2/${config.runpod.endpoint_id}/runsync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.runpod.api_key}`
    },
    body: JSON.stringify({
      input: {
        source_image: req.body.source,
        target_image: req.body.target,
        source_indexes: '-1',
        target_indexes: '-1',
        background_enhance: true,
        face_restore: true,
        face_upsample: true,
        upscale: 1,
        codeformer_fidelity: 0.5,
        output_format: 'JPEG'
      }
    })
  });

  console.log(response);
  if (response.status == 200) {
    const data = await response.json();
    console.log(data);
    if (data.status == 'COMPLETED') {

      const watermark = `iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAACXBIWXMAAC4jAAAuIwF4pT92AAAJTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjowNC0wODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjoxMC0wODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTEtMjlUMTY6MjY6MTAtMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNkYjEyZjVhLWU1MjgtOTU0MS04MWFmLThmZWY0NzgzOTY1ZCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmRlMTMyNTc3LTBhYTgtYmQ0My1iMzc4LWEwYmU0MTcyODczMyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY5NjAyMTQ0LThiNDYtZGM0Zi1hYzhmLWE1YmM3MzFjMzBkNSIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTYwMjE0NC04YjQ2LWRjNGYtYWM4Zi1hNWJjNzMxYzMwZDUiIHN0RXZ0OndoZW49IjIwMjMtMTEtMjlUMTY6MjY6MDQtMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTE2OTljZGItY2QyOS02MDRjLTlkOGQtYmQ4NTE0NWU4YjlkIiBzdEV2dDp3aGVuPSIyMDIzLTExLTI5VDE2OjI2OjEwLTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249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`;
      const imageBuffer = Buffer.from(data.output.image, 'base64');

      const waterMarked = await sharp(imageBuffer)
        .resize(512, 512)
        .composite([{
          input: Buffer.from(watermark, 'base64'),
          // blend: 'dest-in'
          gravity: 'southeast'
        }])
        .toBuffer();

      console.log(waterMarked.toString('base64'));
      res.status(200).send(JSON.stringify({
        image: waterMarked.toString('base64')
      }));
    }
  } else {
    console.error(response);
    res.status(500).send(response);
  }
});

const mobileGenerate = catchAsync(async (req, res) => {
  console.log(req.body)

  request.get(req.body.target, async function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
      data = Buffer.from(body).toString('base64');
      const response = await fetch(`https://api.runpod.ai/v2/${config.runpod.endpoint_id}/runsync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.runpod.api_key}`
        },
        body: JSON.stringify({
          input: {
            source_image: req.body.source,
            target_image: data,
            source_indexes: '-1',
            target_indexes: '-1',
            background_enhance: true,
            face_restore: true,
            face_upsample: true,
            upscale: 1,
            codeformer_fidelity: 0.5,
            output_format: 'JPEG'
          }
        })
      });

      if (response.status == 200) {
        const data = await response.json();
        console.log(data);
        if (data.status == 'COMPLETED') {

          const watermark = `iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAACXBIWXMAAC4jAAAuIwF4pT92AAAJTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjowNC0wODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjoxMC0wODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTEtMjlUMTY6MjY6MTAtMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNkYjEyZjVhLWU1MjgtOTU0MS04MWFmLThmZWY0NzgzOTY1ZCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmRlMTMyNTc3LTBhYTgtYmQ0My1iMzc4LWEwYmU0MTcyODczMyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY5NjAyMTQ0LThiNDYtZGM0Zi1hYzhmLWE1YmM3MzFjMzBkNSIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTYwMjE0NC04YjQ2LWRjNGYtYWM4Zi1hNWJjNzMxYzMwZDUiIHN0RXZ0OndoZW49IjIwMjMtMTEtMjlUMTY6MjY6MDQtMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTE2OTljZGItY2QyOS02MDRjLTlkOGQtYmQ4NTE0NWU4YjlkIiBzdEV2dDp3aGVuPSIyMDIzLTExLTI5VDE2OjI2OjEwLTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmNkYjEyZjVhLWU1MjgtOTU0MS04MWFmLThmZWY0NzgzOTY1ZCIgc3RFdnQ6d2hlbj0iMjAyMy0xMS0yOVQxNjoyNjoxMC0wODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1MTY5OWNkYi1jZDI5LTYwNGMtOWQ4ZC1iZDg1MTQ1ZThiOWQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Njk2MDIxNDQtOGI0Ni1kYzRmLWFjOGYtYTViYzczMWMzMGQ1IiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Njk2MDIxNDQtOGI0Ni1kYzRmLWFjOGYtYTViYzczMWMzMGQ1Ii8+IDxwaG90b3Nob3A6VGV4dExheWVycz4gPHJkZjpCYWc+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iQmVTYXVkaS5haSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iQmVTYXVkaS5haSIvPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOlRleHRMYXllcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+cvYH5QAACK9JREFUeJzt3a1320gUBfD79ixwWQwNXVZDw5RtoGHLNrCw+ycUFS7cwsLABgZmWQMNU9ZAw5St2VugUY6iyPab0eeT7u+cPZv2yJbSsa5HM08jUVUQEXnwW98HQERkxcAiIjcYWETkBgOLiNxgYBGRGwwsInKDgUVEbjCwiMgNBhYRucHAIiI3GFhE5AYDi4jcYGARkRsMLCJyg4FFRG4wsIjIDQYWEbnBwCIiNxhYROQGA4uI3GBgEZEbDCwicoOBRURuMLCIyA0GFhG58XvfB1CXiPR9CK1T1TWAGYA1gHnFJjsA9wD2IrLt8tjIN29PfhdvB1zyqcZrb8P/f4nIfRMH0zRVPQdwkfDSWxG5a/p4xkJVLwEsDZteichDeM0SwKXhNY8i8qXO8bUh5vgBDO74c+57WDU8BYGqbgDcDCW4VHUO4B2AReJbXIRe2bWI7Jo7MqJ+cQwrMwPwLvRoeqWqMwB/Ij2scnMAH1S17vsQDQYD67mLAYTWBarHqeq8H9EoMLBeeht6OZ0L+103/LZL9rJoLKY8hnVIHhp9DFqvWnrfJbKZREoUBt8/930cqQ4dv7dJNwZWtb56JNZLwVsRuQs9pw+G7V/VOCaiwZhKYN2IyDZM7b5H1os65nUHx1TlzLDNPi9ZEJGdqu5wOmAt70s0eFMJLABZt1hVtwBODazPVHUmIvtT7xl6OUtkIVdV2/MA4CeAXV7Tc4SlJ1S+tDt5jMb3haqukIXbCtUhuAfwHQBO1XmFsoqNYbdPNWMRdWc3VQWyoRzkDYC3eP6ltAVwb/j3P6iPOqyG24N1WE49Greb48i4T/gwneN072YZ/kPoDd0dqfc6Mx5bo0K4XOB0z3MWtoOqXiD7XW6Pv6QbJwJyDWCtqvcAbro7qjRjaI+2TDGwrA5+WMKHI6X8YYGs3mtR44N1lvi6F8Ks5HvYqr6rnIdv7msRsX4RNC6iZ7ZCsyUjjRpLe7SJZQ2RaoRV0Xmori/7ZXjtPFz6NMF6i8oxC2RV+b0IJ/nbiJcs0N+kyinu26Nt7GFFCN9eTRWWrlV1VxqL+c/42j8AXAOAiFyl7DwEb1Mn7kJVz3u6f3GB05dOgzei9mgVe1iH/ar4u6aLOsuXMVX7rLJS1cvUAteWClRjejlNGuwlntXI2qNVUwwsywd8Xx4DCB8qS2HnvYh8BvDVsO0sDN7nYoo7lwD+Kr3e6jVO90r2AP4Ov4vluGY93SFg3WfeLl9gm1nt0pjao1WTCqxQgvDGsGnVLJ61u/4AZDVSsM1IFt/3J+JOpvym7cvIca0zwza7QlmHdRWLoY4NAeEkD19EQ6v6PzNsM7b2SDKVMazNgUHuKo+ovi0n5dLDEj5Pg6wislfV74i/YXkJ4KOqVtYnVYj9XawhOuSK+qH1qoqm2B5JJtXDMtgC+HpgSjile235YJU/rFvYa8XKNqr6znAp0NalwuguQTrC9jBiYGUeReSziNxYqtsb9uxDFfZ/jfQewQqn18Ea3Tevc2wPIwZWZq6qn1R108dAZXmfYfzrCuk9rXzxvro1PTnrv8novtEHarLtwcB6bo1s5q3OYOUmhN8n2IsAX3zDisgu3JNWZ9nmy7prYUXMjlIHpt4eUxl0jzFDVik8iBtAReRaVX8gvXr5nap+LV7qWopNVXVe4yEYFIHtYTeVwMqXl1khqxI/NSszV9X1UB6ZJSL34cbpDeJv3ZgjYkHCcOPtKmE/1AK2x3NTCSwATyf+GWzfUktkM3aDEGYurxK/ZY8GVrhszFefoJ6xPQ6bVGAF1tm3Qd7yEVYafUB2iWg9xnlYIeJZwWQ4Mc4x4TGRIWF7nDbFwLJKDSxr8WayEDxfIh4ICpTW94pYYA/hdaOrmh4StocNA+uwPsobTJd74X4yiMhVRGidFfYzh+3k2AP4hizsrCcTRWJ72DGwWhSxLO2XGguubWELrGLphOV+SgD4FpaVHuTl8YiwPYxYh+XfT+N2xR6j5QP/WGcNdIrC9jBiYDmXeCuR5QT5lfC+lIbtYcTAGgbrSqNjx3vq6KgpBlbq9X9KT8Z0AhZ6SUNeAqULo7v3jZo1qUH3MHVsXYq2HB4pg+Jnhm2K72sKrGJNVcS9grFh2FV4dDWAPDvwc2vC4PjHI5vElMAwzDGdHtYm3Iy8gb3hywFlXaUyfwah9SbV3YGfjymGrrXqPfayc1EIw5SaH2tALg/83LTXwFPAe6xhqtseozCpHlakZ4EVVgPd4nQPbRW5zvrTzI+IPKrqHqdDdR16izGKM0yPsIXDB1WN3M0Ta0DOw5dJKnMw1txPm7poj1GYSg8rRVVvp+nHJj1UXBK0USW/L92W08VDNrtaN31o67OnGOVDT9vAwDrsR/kvQnFnU48C36P6seltBNb30p9j63miT6gwkRC7llf0pEMIYu+TFa23x1gwsKrdHao8Dw+nrBtaewBXVfsIf1cVZKl25QdqhpM8Jkz+Tdx3TI809piKYv69HjCwXlmH7eEeA+ulOxE5GkghAL4i7QTbAvinvHJC6f23qLeue+5eRA49H/EGtuO/RuIJHn7Ha8OmD8iWhE4iIvfG/WzDYnlD7JG13h5jwEH37MObXzL9sN7Tl5+MqnqDbCD+FQ6vX5Q/CWdrrUwPa3f9RPYE39h1kXYAbo/dypE/7CJMJCzwcrbxLhzvY5171wqLD75B9rsUJxQekIXqFni5tn2N/ZR/l1tk44WDPdG7ag/vxPusg4j0fQidCCs5AC9P+lweiubQJfJ2/rsPLCKaDo5hEZEbDCwicoOBRURuMLCIyA0GFhG5wcAiIjcYWETkBgOLiNxgYBGRGwwsInKDgUVEbjCwiMgNBhYRucHAIiI3GFhE5AYDi4jcYGARkRsMLCJyg4FFRG4wsIjIDQYWEbnBwCIiNxhYROQGA4uI3GBgEZEbDCwicoOBRURuMLCIyA0GFhG5wcAiIjcYWETkxv9NGhXDyPbatgAAAABJRU5ErkJggg==`;
          const imageBuffer = Buffer.from(data.output.image, 'base64');

          const waterMarked = await sharp(imageBuffer)
            .resize(512, 512)
            .composite([{
              input: Buffer.from(watermark, 'base64'),
              // blend: 'dest-in'
              gravity: 'southeast'
            }])
            .toBuffer();

          console.log(waterMarked.toString('base64'));
          res.status(200).send(JSON.stringify({
            image: waterMarked.toString('base64')
          }));
        }
      } else {
        console.error(response);
        res.status(500).send(response);
      }

    } else {
      res.status(500).send(error);
    }
  });
  // const response = await fetch(req.body.target);
  // const buffer = await response.arrayBuffer();
  // const target = buffer.toString('base64');

  // fetch(req.body.target)
  //   .then(response => response.blob())
  //   .then(async blob => {
  //     const buffer = Buffer.from(await blob.text());
  //     const target = buffer.toString('base64');
  //     console.log(buffer);

  //     const response = await fetch(`https://api.runpod.ai/v2/${config.runpod.endpoint_id}/runsync`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${config.runpod.api_key}`
  //       },
  //       body: JSON.stringify({
  //         input: {
  //           source_image: req.body.source,
  //           target_image: target,
  //           source_indexes: '-1',
  //           target_indexes: '-1',
  //           background_enhance: true,
  //           face_restore: true,
  //           face_upsample: true,
  //           upscale: 1,
  //           codeformer_fidelity: 0.5,
  //           output_format: 'JPEG'
  //         }
  //       })
  //     });

  //     console.log(response);
  //     if (response.status == 200) {
  //       const data = await response.json();
  //       console.log(data);
  //       if (data.status == 'COMPLETED') {

  //         const watermark = `iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAACXBIWXMAAC4jAAAuIwF4pT92AAAJTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjowNC0wODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjoxMC0wODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTEtMjlUMTY6MjY6MTAtMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNkYjEyZjVhLWU1MjgtOTU0MS04MWFmLThmZWY0NzgzOTY1ZCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmRlMTMyNTc3LTBhYTgtYmQ0My1iMzc4LWEwYmU0MTcyODczMyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY5NjAyMTQ0LThiNDYtZGM0Zi1hYzhmLWE1YmM3MzFjMzBkNSIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTYwMjE0NC04YjQ2LWRjNGYtYWM4Zi1hNWJjNzMxYzMwZDUiIHN0RXZ0OndoZW49IjIwMjMtMTEtMjlUMTY6MjY6MDQtMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTE2OTljZGItY2QyOS02MDRjLTlkOGQtYmQ4NTE0NWU4YjlkIiBzdEV2dDp3aGVuPSIyMDIzLTExLTI5VDE2OjI2OjEwLTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249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`; 
  //         const imageBuffer = Buffer.from(data.output.image, 'base64');

  //         const waterMarked = await sharp(imageBuffer)
  //           .resize(512, 512)
  //           .composite([{
  //             input: Buffer.from(watermark, 'base64'),
  //             // blend: 'dest-in'
  //             gravity: 'southeast'
  //           }])
  //           .toBuffer();

  //         console.log(waterMarked.toString('base64'));
  //         res.status(200).send(JSON.stringify({
  //           image: waterMarked.toString('base64')
  //         }));
  //       }
  //     } else {
  //       console.error(response);
  //       res.status(500).send(response);
  //     }

  //   })
  //   .catch(err => {
  //     console.log('>>> Error', err)
  //     res.status(500).send(err);
  //   })
  // const response = await fetch(`https://api.runpod.ai/v2/${config.runpod.endpoint_id}/runsync`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${config.runpod.api_key}`
  //   },
  //   body: JSON.stringify({
  //     input: {
  //       source_image: req.body.source,
  //       target_image: req.body.target,
  //       source_indexes: '-1',
  //       target_indexes: '-1',
  //       background_enhance: true,
  //       face_restore: true,
  //       face_upsample: true,
  //       upscale: 1,
  //       codeformer_fidelity: 0.5,
  //       output_format: 'JPEG'
  //     }
  //   })
  // });

  // console.log(response);
  // if (response.status == 200) {
  //   const data = await response.json();
  //   console.log(data);
  //   if (data.status == 'COMPLETED') {

  //     const watermark = `iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAACXBIWXMAAC4jAAAuIwF4pT92AAAJTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjowNC0wODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0xMS0yOVQxNjoyNjoxMC0wODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTEtMjlUMTY6MjY6MTAtMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNkYjEyZjVhLWU1MjgtOTU0MS04MWFmLThmZWY0NzgzOTY1ZCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmRlMTMyNTc3LTBhYTgtYmQ0My1iMzc4LWEwYmU0MTcyODczMyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY5NjAyMTQ0LThiNDYtZGM0Zi1hYzhmLWE1YmM3MzFjMzBkNSIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTYwMjE0NC04YjQ2LWRjNGYtYWM4Zi1hNWJjNzMxYzMwZDUiIHN0RXZ0OndoZW49IjIwMjMtMTEtMjlUMTY6MjY6MDQtMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTE2OTljZGItY2QyOS02MDRjLTlkOGQtYmQ4NTE0NWU4YjlkIiBzdEV2dDp3aGVuPSIyMDIzLTExLTI5VDE2OjI2OjEwLTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmNkYjEyZjVhLWU1MjgtOTU0MS04MWFmLThmZWY0NzgzOTY1ZCIgc3RFdnQ6d2hlbj0iMjAyMy0xMS0yOVQxNjoyNjoxMC0wODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1MTY5OWNkYi1jZDI5LTYwNGMtOWQ4ZC1iZDg1MTQ1ZThiOWQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Njk2MDIxNDQtOGI0Ni1kYzRmLWFjOGYtYTViYzczMWMzMGQ1IiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Njk2MDIxNDQtOGI0Ni1kYzRmLWFjOGYtYTViYzczMWMzMGQ1Ii8+IDxwaG90b3Nob3A6VGV4dExheWVycz4gPHJkZjpCYWc+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iQmVTYXVkaS5haSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iQmVTYXVkaS5haSIvPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOlRleHRMYXllcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+cvYH5QAACK9JREFUeJzt3a1320gUBfD79ixwWQwNXVZDw5RtoGHLNrCw+ycUFS7cwsLABgZmWQMNU9ZAw5St2VugUY6iyPab0eeT7u+cPZv2yJbSsa5HM08jUVUQEXnwW98HQERkxcAiIjcYWETkBgOLiNxgYBGRGwwsInKDgUVEbjCwiMgNBhYRucHAIiI3GFhE5AYDi4jcYGARkRsMLCJyg4FFRG4wsIjIDQYWEbnBwCIiNxhYROQGA4uI3GBgEZEbDCwicoOBRURuMLCIyA0GFhG58XvfB1CXiPR9CK1T1TWAGYA1gHnFJjsA9wD2IrLt8tjIN29PfhdvB1zyqcZrb8P/f4nIfRMH0zRVPQdwkfDSWxG5a/p4xkJVLwEsDZteichDeM0SwKXhNY8i8qXO8bUh5vgBDO74c+57WDU8BYGqbgDcDCW4VHUO4B2AReJbXIRe2bWI7Jo7MqJ+cQwrMwPwLvRoeqWqMwB/Ij2scnMAH1S17vsQDQYD67mLAYTWBarHqeq8H9EoMLBeeht6OZ0L+103/LZL9rJoLKY8hnVIHhp9DFqvWnrfJbKZREoUBt8/930cqQ4dv7dJNwZWtb56JNZLwVsRuQs9pw+G7V/VOCaiwZhKYN2IyDZM7b5H1os65nUHx1TlzLDNPi9ZEJGdqu5wOmAt70s0eFMJLABZt1hVtwBODazPVHUmIvtT7xl6OUtkIVdV2/MA4CeAXV7Tc4SlJ1S+tDt5jMb3haqukIXbCtUhuAfwHQBO1XmFsoqNYbdPNWMRdWc3VQWyoRzkDYC3eP6ltAVwb/j3P6iPOqyG24N1WE49Greb48i4T/gwneN072YZ/kPoDd0dqfc6Mx5bo0K4XOB0z3MWtoOqXiD7XW6Pv6QbJwJyDWCtqvcAbro7qjRjaI+2TDGwrA5+WMKHI6X8YYGs3mtR44N1lvi6F8Ks5HvYqr6rnIdv7msRsX4RNC6iZ7ZCsyUjjRpLe7SJZQ2RaoRV0Xmori/7ZXjtPFz6NMF6i8oxC2RV+b0IJ/nbiJcs0N+kyinu26Nt7GFFCN9eTRWWrlV1VxqL+c/42j8AXAOAiFyl7DwEb1Mn7kJVz3u6f3GB05dOgzei9mgVe1iH/ar4u6aLOsuXMVX7rLJS1cvUAteWClRjejlNGuwlntXI2qNVUwwsywd8Xx4DCB8qS2HnvYh8BvDVsO0sDN7nYoo7lwD+Kr3e6jVO90r2AP4Ov4vluGY93SFg3WfeLl9gm1nt0pjao1WTCqxQgvDGsGnVLJ61u/4AZDVSsM1IFt/3J+JOpvym7cvIca0zwza7QlmHdRWLoY4NAeEkD19EQ6v6PzNsM7b2SDKVMazNgUHuKo+ovi0n5dLDEj5Pg6wislfV74i/YXkJ4KOqVtYnVYj9XawhOuSK+qH1qoqm2B5JJtXDMtgC+HpgSjile235YJU/rFvYa8XKNqr6znAp0NalwuguQTrC9jBiYGUeReSziNxYqtsb9uxDFfZ/jfQewQqn18Ea3Tevc2wPIwZWZq6qn1R108dAZXmfYfzrCuk9rXzxvro1PTnrv8novtEHarLtwcB6bo1s5q3OYOUmhN8n2IsAX3zDisgu3JNWZ9nmy7prYUXMjlIHpt4eUxl0jzFDVik8iBtAReRaVX8gvXr5nap+LV7qWopNVXVe4yEYFIHtYTeVwMqXl1khqxI/NSszV9X1UB6ZJSL34cbpDeJv3ZgjYkHCcOPtKmE/1AK2x3NTCSwATyf+GWzfUktkM3aDEGYurxK/ZY8GVrhszFefoJ6xPQ6bVGAF1tm3Qd7yEVYafUB2iWg9xnlYIeJZwWQ4Mc4x4TGRIWF7nDbFwLJKDSxr8WayEDxfIh4ICpTW94pYYA/hdaOrmh4StocNA+uwPsobTJd74X4yiMhVRGidFfYzh+3k2AP4hizsrCcTRWJ72DGwWhSxLO2XGguubWELrGLphOV+SgD4FpaVHuTl8YiwPYxYh+XfT+N2xR6j5QP/WGcNdIrC9jBiYDmXeCuR5QT5lfC+lIbtYcTAGgbrSqNjx3vq6KgpBlbq9X9KT8Z0AhZ6SUNeAqULo7v3jZo1qUH3MHVsXYq2HB4pg+Jnhm2K72sKrGJNVcS9grFh2FV4dDWAPDvwc2vC4PjHI5vElMAwzDGdHtYm3Iy8gb3hywFlXaUyfwah9SbV3YGfjymGrrXqPfayc1EIw5SaH2tALg/83LTXwFPAe6xhqtseozCpHlakZ4EVVgPd4nQPbRW5zvrTzI+IPKrqHqdDdR16izGKM0yPsIXDB1WN3M0Ta0DOw5dJKnMw1txPm7poj1GYSg8rRVVvp+nHJj1UXBK0USW/L92W08VDNrtaN31o67OnGOVDT9vAwDrsR/kvQnFnU48C36P6seltBNb30p9j63miT6gwkRC7llf0pEMIYu+TFa23x1gwsKrdHao8Dw+nrBtaewBXVfsIf1cVZKl25QdqhpM8Jkz+Tdx3TI809piKYv69HjCwXlmH7eEeA+ulOxE5GkghAL4i7QTbAvinvHJC6f23qLeue+5eRA49H/EGtuO/RuIJHn7Ha8OmD8iWhE4iIvfG/WzDYnlD7JG13h5jwEH37MObXzL9sN7Tl5+MqnqDbCD+FQ6vX5Q/CWdrrUwPa3f9RPYE39h1kXYAbo/dypE/7CJMJCzwcrbxLhzvY5171wqLD75B9rsUJxQekIXqFni5tn2N/ZR/l1tk44WDPdG7ag/vxPusg4j0fQidCCs5AC9P+lweiubQJfJ2/rsPLCKaDo5hEZEbDCwicoOBRURuMLCIyA0GFhG5wcAiIjcYWETkBgOLiNxgYBGRGwwsInKDgUVEbjCwiMgNBhYRucHAIiI3GFhE5AYDi4jcYGARkRsMLCJyg4FFRG4wsIjIDQYWEbnBwCIiNxhYROQGA4uI3GBgEZEbDCwicoOBRURuMLCIyA0GFhG5wcAiIjcYWETkxv9NGhXDyPbatgAAAABJRU5ErkJggg==`; 
  //     const imageBuffer = Buffer.from(data.output.image, 'base64');

  //     const waterMarked = await sharp(imageBuffer)
  //       .resize(512, 512)
  //       .composite([{
  //         input: Buffer.from(watermark, 'base64'),
  //         // blend: 'dest-in'
  //         gravity: 'southeast'
  //       }])
  //       .toBuffer();

  //     console.log(waterMarked.toString('base64'));
  //     res.status(200).send(JSON.stringify({
  //       image: waterMarked.toString('base64')
  //     }));
  //   }
  // } else {
  //   console.error(response);
  //   res.status(500).send(response);
  // }
})

module.exports = {
  generateImage,
  mobileGenerate
};
