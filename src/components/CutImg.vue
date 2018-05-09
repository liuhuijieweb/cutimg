<template>
  <div class="cropper-modal">
    <div class="overlay"></div>
    <div class="modal">
      <div class="modal-content clearfix">
        <div class="img-clip-wrap">
          <div class="container-bg">
            <div class="img-container">
              <img id="clip_src_img" @load="srcImgLoaded" :src="img">
              <div class="shadow-box"></div>
              <div class="crop-wrap" ref="box"  >
                <div class="shadow-box" :style="recStyle">
                  <img :src="img" class="shadow-img" :style="imgStyle">
                </div>
                <div class="crop-box" @mousedown="boxMouseDown"  :class="showBox ? 'show': ''" :style="recStyle">
                  <span class="drag-point point-lt" @mousedown="pointMouseDown('drag-lt', $event)"></span>
                  <span class="drag-point point-lb" @mousedown="pointMouseDown('drag-lb', $event)"></span>
                  <span class="drag-point point-rt" @mousedown="pointMouseDown('drag-rt', $event)"></span>
                  <span class="drag-point point-rb" @mousedown="pointMouseDown('drag-rb', $event)"></span>
                  <span class="drag-point point-t" :style="leftStyle"  @mousedown="pointMouseDown('drag-t', $event)"></span>
                  <span class="drag-point point-b" :style="leftStyle"  @mousedown="pointMouseDown('drag-b', $event)"></span>
                  <span class="drag-point point-l" :style="rightStyle"  @mousedown="pointMouseDown('drag-l', $event)"></span>
                  <span class="drag-point point-r" :style="rightStyle"  @mousedown="pointMouseDown('drag-r', $event)"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="reset-img">
            <i class="icon-reset"></i>
            <span>选择图片</span>
            <input type="file" id="file_input" accept="image/png,image/jpg,image/gif" @change="fileChange">
          </div>
        </div>
        <div class="img-preview-wrap">
          <div class="pre-container">
            <img id="clip_res_img" :src="img">
          </div>
        </div>
        <div class="img-preview-wrap">
          <span>上传结果：</span>
          <div class="pre-container">
            <img  :src="clipData">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a class="modal-btn btn-confirm" @click="clip">上传</a>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name:'cutimg',
    data () {
      return {
        img: null,
        $srcImg: null,
        $resImg: null,
        $input: null,
        $imgContainer: null,
        $preContainer: null,
        nw: 0,
        nh: 0,
        clipData: null,
        ratio: 16 / 10,
        imgSize: {w: 0, h: 0},
        containerTop: 0,
        rec: {
          w: 0, h: 0, l: 0, t: 0
        },
        pl: 0,
        pt: 0,
        action: '',
        actionPoint: {x: 0, y: 0},
        referPoint: {x: 0, y: 0},
        $rec: null
      }
    },
    computed: {
      showBox () {
        return this.rec.w && this.rec.h
      },
      imgStyle () {
        return `width:${this.imgSize.w}px;height:${this.imgSize.h}px;top:${-this.rec.t}px;left:${-this.rec.l}px;`
      },
      recStyle () {
        return `width:${this.rec.w}px;height:${this.rec.h}px;left:${this.rec.l}px;top:${this.rec.t}px;`
      },
      leftStyle(){
        return `width:${this.rec.w-12}px;`;
      },
      rightStyle(){
        return `height:${this.rec.h-12}px;`;
      }
    },
    mounted () {
      this.$input = this.$el.querySelectorAll('#file_input')[0];
      this.$srcImg = this.$el.querySelectorAll('#clip_src_img')[0];
      this.$resImg = this.$el.querySelectorAll('#clip_res_img')[0];
      this.$imgContainer = this.$el.querySelectorAll('.img-container')[0];
      this.$preContainer = this.$el.querySelectorAll('.pre-container')[0];
      this.$containerBox = this.$el.querySelectorAll('.container-bg')[0];
      window.addEventListener('mouseup', this.disableDrag);
      window.addEventListener('mousemove', this.updateRec)

    },
    beforeDestroy () {
      window.removeEventListener('mouseup', this.disableDrag);
      window.removeEventListener('mousemove', this.updateRec)
    },
    methods: {
      getLeft (el) {
        let left = el.offsetLeft;
        let parent = el.offsetParent;

        while (parent) {
          left += parent.offsetLeft;
          parent = parent.offsetParent
        }
        return left
      },
      getTop (el) {
        let top = el.offsetTop;
        let parent = el.offsetParent;

        while (parent) {
          top += parent.offsetTop;
          parent = parent.offsetParent
        }
        return top
      },
      initAction (name, x, y) {
        this.action = name;
        this.pl = this.getLeft(this.$refs.box);
        this.pt = this.getTop(this.$refs.box);
        this.actionPoint = {x, y};
        this.referPoint = {x: this.rec.l, y: this.rec.t};

        if (name === 'drag-lt') {
          this.referPoint = {x: this.rec.l + this.rec.w, y: this.rec.t + this.rec.h}
        } else if (name === 'drag-lb') {
          this.referPoint = {x: this.rec.l + this.rec.w, y: this.rec.t}
        } else if (name === 'drag-rt') {
          this.referPoint = {x: this.rec.l, y: this.rec.t + this.rec.h}
        } else if (name === 'drag-rb') {
          this.referPoint = {x: this.rec.l, y: this.rec.t}
        } else if (name === 'drag-t') {
          this.referPoint = {x: this.rec.l, y: this.rec.t + this.rec.h}
        } else if (name === 'drag-r') {
          this.referPoint = {x: this.rec.l, y: this.rec.t}
        } else if (name === 'drag-b') {
          this.referPoint = {x: this.rec.l, y: this.rec.t}
        } else if (name === 'drag-l') {
          this.referPoint = {x: this.rec.l + this.rec.w, y: this.rec.t}
        }
      },
      pointMouseDown (name, e) {
        this.initAction(name, e.pageX, e.pageY);
        e.preventDefault();
        e.stopPropagation()
      },
      boxMouseDown (e) {
        this.initAction('move', e.pageX, e.pageY);
        e.preventDefault();
        e.stopPropagation()
      },
      disableDrag () {
        if (this.action) {
          this.action = '';
        }
      },
      clearRec () {
        this.action = '';
        this.rec = {w: 0, h: 0, l: 0, t: 0}
      },
      updateRec (e) {
        if (!this.action) {
          return
        }

        const elWidth = this.$refs.box.offsetWidth;
        const elHeight = this.$refs.box.offsetHeight;
        const dx = e.pageX - this.actionPoint.x;
        const dy = e.pageY - this.actionPoint.y;
        const x = e.pageX;
        const y = e.pageY;
        let w = 0;
        let h = 0;
        let t = 0;
        let l = 0;

        if (dx === 0 && dy === 0) {
          return
        }

        if (this.action === 'move') {
          t = dy + this.referPoint.y;
          l = dx + this.referPoint.x;

          if (t <= 0) {
            t = 0
          } else if (t + this.rec.h >= elHeight) {
            t = elHeight - this.rec.h;
          }

          if (l <= 0) {
            l = 0
          } else if (l + this.rec.w >= elWidth) {
            l = elWidth - this.rec.w;
          }

          this.rec.l = l;
          this.rec.t = t;
        } else if (this.action === 'cross')
        {
          if (dx > 0 && dy > 0) {
            w = dx + this.rec.l >= elWidth ? elWidth - this.rec.l : dx;
            h = w / this.ratio;

            if (h + this.rec.t > elHeight) {
              h = elHeight - this.rec.t;
              w = h * this.ratio
            }
            this.rec.w = w;
            this.rec.h = h;
          } else if (dx > 0 && dy < 0) {
            w = dx + this.referPoint.x >= elWidth ? elWidth - this.referPoint.x : dx;
            h = w / this.ratio;

            if (h >= this.referPoint.y) {
              h = this.referPoint.y;
              w = h * this.ratio;
            }

            this.rec.t = this.referPoint.y - h;
            this.rec.w = w;
            this.rec.h = h;
          } else if (dx < 0 && dy < 0) {
            w = dx + this.referPoint.x <= 0 ? this.referPoint.x : -dx;
            h = w / this.ratio;

            if (h >= this.referPoint.y) {
              h = this.referPoint.y;
              w = h * this.ratio;
            }

            this.rec.t = this.referPoint.y - h;
            this.rec.l = this.referPoint.x - w;
            this.rec.w = w;
            this.rec.h = h;
          } else if (dx < 0 && dy > 0) {
            w = dx + this.referPoint.x <= 0 ? this.referPoint.x : -dx;
            h = w / this.ratio;
            if (h + this.referPoint.y >= elHeight) {
              h = elHeight - this.referPoint.y;
              w = h * this.ratio;
            }
            this.rec.l = this.referPoint.x - w;
            this.rec.w = w;
            this.rec.h = h;
          }
        } else if (this.action === 'drag-lt' || this.action === 'drag-rt'
          || this.action === 'drag-lb' || this.action === 'drag-rb')
        {
          w = x - (this.referPoint.x + this.pl);
          h = y - (this.referPoint.y + this.pt);
          if (w < 0 && h < 0) { //左上
            w = w * -1 >= this.referPoint.x ? this.referPoint.x : w * -1;
            h = w / this.ratio;

            if (h >= this.referPoint.y) {
              h = this.referPoint.y;
              w = h * this.ratio;
            }
            this.rec.l = this.referPoint.x - w;
            this.rec.t = this.referPoint.y - h
          } else if (w < 0 && h > 0) { //左下
            w = w * -1 >= this.referPoint.x ? this.referPoint.x : w * -1;
            h = w / this.ratio;

            if (h >= elHeight - this.referPoint.y) {
              h = elHeight - this.referPoint.y;
              w = h * this.ratio;
            }
            this.rec.l = this.referPoint.x - w;
            this.rec.t = this.referPoint.y;
          } else if (w > 0 && h < 0) {  //右上
            w = w >= elWidth - this.referPoint.x ? elWidth - this.referPoint.x : w;
            h = w / this.ratio;

            if (h >= this.referPoint.y) {
              h = this.referPoint.y;
              w = h * this.ratio;
            }
            this.rec.l = this.referPoint.x;
            this.rec.t = this.referPoint.y - h;

          } else if (w > 0 && h > 0) {//右下
            w = w >= elWidth - this.referPoint.x ? elWidth - this.referPoint.x : w;
            h = w / this.ratio;

            if (h >= elHeight - this.referPoint.y) {
              h = elHeight - this.referPoint.y;
              w = h * this.ratio;
            }
            this.rec.l = this.referPoint.x;
            this.rec.t = this.referPoint.y;
          }
          this.rec.w = w;
          this.rec.h = h;
        }else if(this.action === 'drag-t'){
          h = y - (this.referPoint.y + this.pt);
          h = h * -1 >= this.referPoint.y ? this.referPoint.y : h * -1;
          if (h <= 10) {
            return;
          }
          this.rec.l = this.referPoint.x;
          this.rec.t = this.referPoint.y-h;
          this.rec.h = h;
          this.ratio = this.rec.w / this.rec.h;
        }else if(this.action === 'drag-b'){
          h = y - (this.referPoint.y + this.pt);
          h = h >= elHeight - this.referPoint.y ? elHeight - this.referPoint.y : h;
          if (h <= 10) {
            return;
          }
          this.rec.l = this.referPoint.x;
          this.rec.t = this.referPoint.y;
          this.rec.h = h;
          this.ratio = this.rec.w / this.rec.h;
        }else if(this.action === 'drag-l'){
          w = x - (this.referPoint.x + this.pl);
          w = w * -1 >= this.referPoint.x ? this.referPoint.x : w * -1;
          if (w <= 10) {
            return;
          }
          this.rec.l = this.referPoint.x-w;
          this.rec.t = this.referPoint.y;
          this.rec.w = w;
          this.ratio = this.rec.w / this.rec.h;
        }else if(this.action === 'drag-r'){
          w = x - (this.referPoint.x + this.pl);
          w = w >= elWidth - this.referPoint.x ? elWidth - this.referPoint.x : w;
          if (w <= 10) {
            return;
          }
          this.rec.l = this.referPoint.x;
          this.rec.t = this.referPoint.y;
          this.rec.w = w;
          this.ratio = this.rec.w / this.rec.h;
        }
        this.selectChange();
      },
      selectChange () {
        const rec = this.rec;
        if (rec.w > 0 && rec.h > 0) {
          this.updatePreview();
        }
      },
      fileChange () {
        const me = this;
        const fd = new FileReader();
        fd.onloadend = function () {
          me.img = fd.result;
        };
        if (this.$input.files && this.$input.files[0]) {
          fd.readAsDataURL(this.$input.files[0])
        }
      },
      srcImgLoaded () {
        this.nw = this.$srcImg.naturalWidth;
        this.nh = this.$srcImg.naturalHeight;
        this.clearSelect();
        this.setImgSize();
        this.updatePreview();
      },
      clearSelect () {
        this.clearRec();
        this.clipData = null;
      },
      setImgSize () {
        const nr = this.nw / this.nh;
        const scw = this.$containerBox.offsetWidth;
        const sch = this.$containerBox.offsetHeight;
        let rw = 0;
        let rh = 0;
        if (nr >= this.ratio) {
          this.imgSize.w = scw;
          this.imgSize.h = scw / nr;
          this.containerTop = (sch - this.imgSize.h) / 2;
          rh = this.imgSize.h;
          rw = rh * this.ratio;
        } else {
          this.imgSize.h = sch;
          this.imgSize.w = sch * nr;
          this.containerTop = 0;
          rw = this.imgSize.w;
          rh = rw / this.ratio;
        }
        this.$srcImg.setAttribute('style', `width:${this.imgSize.w}px;height:${this.imgSize.h}px;`);
        this.$imgContainer.setAttribute('style',
          `width:${this.imgSize.w}px;height:${this.imgSize.h}px;top:${this.containerTop}px;`);
        this.rec = {w: rw, h: rh, l: 0, t: 0}
      },
      getComputedRec (r) {
        const cw = this.$imgContainer.offsetWidth;
        const ch = this.$imgContainer.offsetHeight;
        const wr = cw / this.nw;
        const hr = ch / this.nh;
        return {
          l: r.l / wr, t: r.t / hr,
          w: r.w / wr, h: r.h / hr
        }
      },
      updatePreview () {
        const rec = this.rec;
        const pcw = this.$preContainer.offsetWidth;
        const pch = this.$preContainer.offsetHeight;
        const wr = pcw / rec.w;
        const hr = pch / rec.h;
        const w = wr * this.$imgContainer.offsetWidth;
        const h = hr * this.$imgContainer.offsetHeight;
        const l = -rec.l * wr;
        const t = -rec.t * hr;
        this.$resImg.setAttribute('style',
          `width:${w}px;height:${h}px;top:${t}px;left:${l}px;`)
      },
      clip () {
        let rec = this.rec;
        if (!rec.w || !rec.h) {
          return
        }

        const bufferCanvas = document.createElement('canvas');
        const bfx = bufferCanvas.getContext('2d');
        const computedRec = this.getComputedRec(rec);
        bufferCanvas.width = computedRec.w;
        bufferCanvas.height = computedRec.h;
        bfx.drawImage(this.$srcImg, -computedRec.l, -computedRec.t, this.nw, this.nh);
        this.clipData = bufferCanvas.toDataURL('image/jpeg', 1);
        // alert(this.clipData)
      }
    }
  }
</script>

<style scoped>
  .cropper-modal .modal {
    width: 840px;
    height: 524px;
    background-color: #fff;
  }

  .modal-content {
    padding: 30px 40px 40px;
  }

  .img-clip-wrap {
    width: 500px;
    height: 330px;
    border-right: 1px solid #e5e9ef;
    float: left;
  }

  .container-bg {
    width: 480px;
    height: 300px;
    background-color: #000;
    border-radius: 4px;
  }

  .img-container {
    position: relative;
    height: 0;
    margin: auto;
  }

  .img-container img {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .img-container .shadow-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    z-index: 1;
  }

  .reset-img {
    position: relative;
    display: inline-block;
    margin-top: 16px;
    color: #6d757a;
    font-size: 12px;
    cursor: pointer;
    overflow: hidden;
  }

  .reset-img input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
    cursor: pointer
  }

  .reset-img:hover {
    color: #00b5e5;
  }

  .img-preview-wrap {
    width: 240px;
    float: right;
  }

  .pre-container {
    width: 240px;
    height: 150px;
    background-color: #000;
    overflow: hidden;
    border-radius: 4px;
  }

  .pre-container img {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
  .clearfix:before, .clearfix:after {
    content: ' ';
    display: table;
  }

  .clearfix:after {
    clear: both;
  }

  .modal-footer {
    text-align: center;
  }

  .modal-btn {
    display: inline-block;
    width: 110px;
    height: 32px;
    font-size: 14px;
    line-height: 32px;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
  }

  .btn-confirm {
    border: 1px solid #00a1d6;
    color: #fff;
    background-color: #00a1d6;
  }

  .btn-confirm:hover {
    background-color: #00b5e5;
  }
  .crop-wrap {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    cursor: crosshair;
  }

  .crop-box {
    background: #000;
    opacity:0;
    position: absolute;
    display: none;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    cursor: move;
    z-index: 2;
    box-sizing: border-box;
  }

  .crop-box.show {
    display: block;
  }

  .drag-point {
    display: inline-block;
    width: 10px;
    height: 10px;
    position: absolute;
    box-sizing: border-box;
  }

  .point-lt {
    top: -4px;
    left: -4px;
    cursor: nw-resize;
  }

  .point-lb {
    left: -4px;
    bottom: -4px;
    cursor: sw-resize;
  }

  .point-rt {
    right: -4px;
    top: -4px;
    cursor: ne-resize;
  }

  .point-rb {
    right: -4px;
    bottom: -4px;
    cursor: se-resize;
  }
  .point-t{
    top:-4px;
    left:6px;
    cursor:n-resize;
  }
  .point-b{
    bottom:-4px;
    left:6px;
    cursor:s-resize;
  }
  .point-l{
    left:-4px;
    top:6px;
    cursor:w-resize;
  }
  .point-r{
    right:-4px;
    top:6px;
    cursor:e-resize;
  }

  .shadow-box {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    z-index: 1;
  }

  .shadow-img {
    position: absolute;
    top: 0;
    left: 0;
  }

  .shadow-box::selection, .shadow-img::selection {
    background-color: transparent;
  }
</style>
