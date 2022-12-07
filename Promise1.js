
(function (Window) {
    /**
     * Promise构造函数
     */
    function Promise(excutor) {
        const self = this
        self.status = 'pending'
        self.data = undefined // 返回的值
        self.callbacks = [] // 存储待执行的回调函数的队列 p.than((resolve)=>{},(reject)=>{})

        /**
         * 成功的回调 指定成功的值
         * 执行p.than((resolve)=>{},(reject)=>{})的一个或多个回调
         */
        function resolve(value) {
            if(self.status !='pending') return
            self.status = 'resolved'
            self.data = value
            // 执行指定的回调
            if (self.callbacks.length > 0) {
                self.callbacks.forEach(callback => {
                    // 模拟异步执行
                    setTimeout(() => {
                        callback.onResolved(value)
                    }, 0)
                })
            }
        }
        /**
         * 失败的回调 指定失败原因及状态
         */
        function reject(reason) {
            self.status = 'rejected'
            self.data = reason
            // 执行指定的回调
            if (self.callbacks.length > 0) {
                self.callbacks.forEach(callback => {
                    // 模拟异步执行
                    setTimeout(() => {
                        callback.onRejected(reason)
                    }, 0)
                })
            }
        }

        /**
        * 捕获同步错误
        */
        try {
            excutor(resolve, reject)
        } catch (error) {
            reject(error)
        }

    }
    /**
     * 指定成功和失败回调的方法
     */
    Promise.prototype.then = function (onResolved, onRejected) {
        onResolved = typeof onResolved === 'function' ? onResolved : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        // 将回调存放进队列
        // 根据不同的状态将值返回，或者存入回调队列中
        const self = this
        // 链式调用 返回一个Promise
        return new Promise((resolve, reject) => {
            function handle(callback) {
                try {
                    const result = callback(self.data)
                    if (result instanceof Promise) {
                        result.then(
                            value => {
                                resolve(value)
                            },
                            reason => {
                                reject(reason)
                            }
                        )
                    } else {
                        resolve(result)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            if (self.status === 'resolved') {
                // 模拟异步执行
                setTimeout(() => {
                    handle(onResolved)
                }, 0)
            } else if (self.status === 'rejected') {
                // 模拟异步执行
                setTimeout(() => {
                    handle(onRejected)
                }, 0)
            } else {
                // 处在pending状态
                this.callbacks.push({
                    onResolved: () => {
                        // onResolved(self.value)
                        handle(onResolved)
                    },
                    onRejected: () => {
                        handle(onRejected)
                        // onRejected(self.reason)
                    }
                })
            }
        })
    }
    /**
     * 指定失败回调的方法
     */
    Promise.prototype.catch = function (onRejected) {
        // p.then(resolve, reject)
        // 指定失败的
        return this.then(null, onRejected)
    }
    /**
     * 返回成功promise静态方法
     */
    Promise.resolve = function (value) {
        return new Promise((resolve, reject) => {
            if(value instanceof Promise){
                value.then(resolve, reject)
            }else{
                resolve(value)
            }
        })
    }
    /**
     * 返回失败promise静态方法
     */
    Promise.reject = function (reason) {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }
    /**
     * promise静态方法
     * 所有的promise成功返回最终成功的promise
     * 只要有一个失败返回失败的promise
     */
    Promise.all = function (promises) {
        const length = promises.length
        let resolveCount = 0
        const values = new Array(length)
        return new Promise((resolve, reject)=>{
            promises.forEach((p,index)=> {
                Promise.resolve(p).then(
                    value =>{
                        // 所有的成功\所有的数据
                        resolveCount++
                        values[index] = value
                        if(resolveCount === length){
                            resolve(values)
                        }
                    },
                    reason => reject(reason)
                )
            })
        })
    }
    /**
    * promise静态方法
    * 所有的promise成功返回最终成功的promise
    * 只要有个成功promise返回成功的promise
    */
    Promise.race = function (promises) {
        return new Promise((resolve, reject)=>{
            promises.forEach(p => {
                Promise.resolve(p).then(
                    value =>resolve(value),
                    reason => reject(reason)
                )
            })
        })
    }

    Window.Promise = Promise
})(window)